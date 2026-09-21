import { NextResponse } from 'next/server';
import { db } from '@hisab-kitab/database';
import { supabase } from '@/lib/supabase';
import { extractLedgerData } from '@/lib/gemini';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Ensure this exists, or handle session properly

export async function POST(req: Request) {
  try {
    // 1. Get user session (mocked if not using authOptions directly here, adjust as needed)
    // const session = await getServerSession(authOptions);
    // if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Using a placeholder userId for now if session isn't available easily
    // In a real flow, use session.user.id
    let userId = "placeholder_user_id"; // TODO: get from session

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const shopId = formData.get('shopId') as string;
    const asOfDateStr = formData.get('asOfDate') as string;

    if (!file || !shopId) {
      return NextResponse.json({ error: 'Missing file or shopId' }, { status: 400 });
    }

    const asOfDate = asOfDateStr ? new Date(asOfDateStr) : new Date();

    // 2. Upload to Supabase Storage (assuming bucket "ledger-images" exists)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `shop_${shopId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ledger-images') // Make sure this bucket is created in Supabase
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Fallback: we can still proceed with Gemini even if storage fails in dev
      // return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
    }

    const imageUrl = uploadData?.path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ledger-images/${uploadData.path}`
      : "https://placeholder-url.com/image.jpg"; // fallback

    // 3. Create Batch and Page records in DB
    // First check if shop exists, otherwise create a mock one for testing or handle it
    let shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
       // Fallback for testing: find any shop
       shop = await db.shop.findFirst();
       if (!shop) {
         // Create a dummy shop if none exist
         shop = await db.shop.create({
           data: {
             name: "Demo Shop for Khata Import",
             createdBy: userId
           }
         });
       }
       // Update shopId to the valid one
       shopId = shop.id;
    }

    // Try to get actual user or use the shop creator
    userId = shop.createdBy;
    
    // If no valid user, find any user
    if (!userId || userId === "placeholder_user_id") {
      const user = await db.user.findFirst();
      if (!user) {
        const newUser = await db.user.create({
          data: { email: "demo@example.com", name: "Demo User", preferredLanguage: "en" }
        });
        userId = newUser.id;
      } else {
        userId = user.id;
      }
    }

    const batch = await db.paperImportBatch.create({
      data: {
        shopId,
        uploadedBy: userId,
        asOfDate,
        status: 'PROCESSING'
      }
    });

    const page = await db.paperImportPage.create({
      data: {
        batchId: batch.id,
        imageUrl,
        status: 'PENDING'
      }
    });

    // 4. Run Gemini Extraction
    const base64Image = buffer.toString('base64');
    let extractedData = null;
    let confidence = 0.9; // placeholder
    
    try {
      extractedData = await extractLedgerData(base64Image, file.type);
      
      // Update DB to EXTRACTED
      await db.paperImportPage.update({
        where: { id: page.id },
        data: {
          status: 'EXTRACTED',
          rawExtractedJson: extractedData,
          confidenceScore: confidence
        }
      });
      
      await db.paperImportBatch.update({
        where: { id: batch.id },
        data: { status: 'READY_FOR_REVIEW' }
      });
      
    } catch (e) {
      console.error("Gemini Extraction Error", e);
      await db.paperImportPage.update({
        where: { id: page.id },
        data: { status: 'FAILED' }
      });
      return NextResponse.json({ error: 'AI Extraction failed' }, { status: 500 });
    }

    // 5. Return data for UI review
    return NextResponse.json({
      success: true,
      batchId: batch.id,
      pageId: page.id,
      imageUrl,
      extractedData
    });

  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
