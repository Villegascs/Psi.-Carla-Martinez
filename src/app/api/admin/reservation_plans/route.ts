import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

// GET all plans and the coaching addon
export async function GET() {
  try {
    const adminDb = getAdminDb();
    
    // Fetch plans
    const plansSnapshot = await adminDb.collection('reservation_plans').orderBy('createdAt', 'asc').get();
    const plans = plansSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Fetch reservation plans error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch plans" }, { status: 500 });
  }
}

// POST a new plan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, description, isCoachingAddon } = body;

    const adminDb = getAdminDb();
    const newPlanRef = adminDb.collection('reservation_plans').doc();
    
    const planData = {
      id: newPlanRef.id,
      name,
      price: Number(price),
      description: description || "",
      isCoachingAddon: !!isCoachingAddon,
      createdAt: new Date().toISOString()
    };

    await newPlanRef.set(planData);

    return NextResponse.json({ success: true, plan: planData });
  } catch (error) {
    console.error("Create reservation plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to create plan" }, { status: 500 });
  }
}

// PUT to update a plan
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, description, isCoachingAddon } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const planRef = adminDb.collection('reservation_plans').doc(id);
    
    await planRef.update({
      name,
      price: Number(price),
      description: description || "",
      isCoachingAddon: !!isCoachingAddon,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update reservation plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to update plan" }, { status: 500 });
  }
}

// DELETE to delete a plan
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    await adminDb.collection('reservation_plans').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reservation plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete plan" }, { status: 500 });
  }
}
