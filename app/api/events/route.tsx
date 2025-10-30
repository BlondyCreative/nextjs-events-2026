
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Event from "@/database/event.model";
import {v2 as cloudinary} from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { existsSync } from 'fs';

// Ensure secure URLs; credentials come from CLOUDINARY_URL or explicit vars
cloudinary.config({ secure: true });

// Check if Cloudinary is configured (cloud_name is required)
const hasCloudinary = Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

// Type for incoming event payload
type EventInput = {
  title?: string;
  slug?: string;
  description?: string;
  overview?: string;
  image?: string;
  venue?: string;
  location?: string;
  date?: string;
  time?: string;
  mode?: string;
  audience?: string;
  agenda?: string[];
  organizer?: string;
  tags?: string[];
};

// List events

// Handle CORS preflight if the app hits this route from another origin
export async function OPTIONS() {
  return NextResponse.json(null, { status: 204 });
}

export async function GET() {
  await connectDB();
  const events = await Event.find({}).lean();
  return NextResponse.json({ events });
}



// Create an event (accepts application/json and form-data)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const contentType = req.headers.get("content-type") || "";

    // Helper
    const toArray = (v: unknown): string[] => {
      if (Array.isArray(v)) return (v as unknown[]).filter(Boolean).map(String);
      if (typeof v === "string") {
        const s = v.trim();
        if (!s) return [];
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch {}
        const delimited = s.split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
        if (delimited.length > 1) return delimited;
        return [s];
      }
      if (v == null) return [];
      return [String(v)];
    };

    let payload: EventInput = {};
    let imageUrl = "";

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();

      // Image can be a File, a data URL, or an http(s) URL
      const img = form.get("image");
      if (img && typeof img !== "string") {
        // File branch
        const file = img as File;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (hasCloudinary) {
          // Upload to Cloudinary
          const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image", folder: "DevEvent" },
              (err, res) => (err ? reject(err) : resolve(res as UploadApiResponse))
            );
            stream.end(buffer);
          });
          imageUrl = result.secure_url as string;
        } else {
          // Save locally to /public/uploads
          const ext = file.name.split(".").pop() || "png";
          const filename = `${randomBytes(16).toString("hex")}.${ext}`;
          const filepath = path.join(process.cwd(), "public", "uploads", filename);
          await writeFile(filepath, buffer);
          imageUrl = `/uploads/${filename}`; // Relative URL for Next.js
        }
      } else if (typeof img === "string" && img.trim()) {
        const s = img.trim();
        if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) {
          if (hasCloudinary) {
            const res = await cloudinary.uploader.upload(s, { folder: "DevEvent" });
            imageUrl = res.secure_url;
          } else {
            imageUrl = s;
          }
        } else if (s.startsWith("/") || s.startsWith("~") || s.match(/^[A-Za-z]:\\/)) {
          // Absolute or home path: treat as local file path
          let localPath = s;
          if (s.startsWith("~")) {
            localPath = s.replace(/^~/, process.env.HOME || "/");
          }
          if (!existsSync(localPath)) {
            return NextResponse.json({ message: `File not found: ${localPath}` }, { status: 400 });
          }
          const buffer = await readFile(localPath);
          if (hasCloudinary) {
            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { resource_type: "image", folder: "DevEvent" },
                (err, res) => (err ? reject(err) : resolve(res as UploadApiResponse))
              );
              stream.end(buffer);
            });
            imageUrl = result.secure_url as string;
          } else {
            const ext = path.extname(localPath).slice(1) || "png";
            const filename = `${randomBytes(16).toString("hex")}.${ext}`;
            const filepath = path.join(process.cwd(), "public", "uploads", filename);
            await writeFile(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
          }
        } else {
          return NextResponse.json({ message: "Invalid image field: send a File, a data URL, an http(s) URL, or an absolute file path" }, { status: 400 });
        }
      }




      const toStr = (v: FormDataEntryValue | null) => (v == null ? "" : String(v));
      payload = {
        title: toStr(form.get("title")),
        slug: toStr(form.get("slug")),
        description: toStr(form.get("description")),
        overview: toStr(form.get("overview")),
        venue: toStr(form.get("venue")),
        location: toStr(form.get("location")),
        date: toStr(form.get("date")),
        time: toStr(form.get("time")),
        mode: toStr(form.get("mode")) || "hybrid",
        audience: toStr(form.get("audience")),
        organizer: toStr(form.get("organizer")),
        agenda: toArray(toStr(form.get("agenda"))),
        tags: toArray(toStr(form.get("tags"))),
      };
    } else if (contentType.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>;
      payload = {
        title: String(body.title ?? ""),
        slug: String(body.slug ?? ""),
        description: String(body.description ?? ""),
        overview: String(body.overview ?? ""),
        image: String(body.image ?? ""),
        venue: String(body.venue ?? ""),
        location: String(body.location ?? ""),
        date: String(body.date ?? ""),
        time: String(body.time ?? ""),
        mode: String(body.mode ?? "hybrid"),
        audience: String(body.audience ?? ""),
        organizer: String(body.organizer ?? ""),
        agenda: toArray(body.agenda),
        tags: toArray(body.tags),
      };
      imageUrl = payload.image || "";
    } else {
      return NextResponse.json({ message: "Unsupported Content-Type" }, { status: 415 });
    }

    // Normalize allowed enum for mode
    if (typeof payload.mode === "string") {
      const m = payload.mode.toLowerCase();
      payload.mode = ["online", "offline", "hybrid"].includes(m) ? m : "hybrid";
    }

    if (!imageUrl) {
      return NextResponse.json({ message: "Image is required" }, { status: 400 });
    }
    payload.image = imageUrl;

    const createdEvent = await Event.create(payload);

    // Revalidate the home page to show new event immediately
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' })
      }).catch(() => null);
    } catch {
      console.log('Revalidation hint: Page will refresh in max 60 seconds');
    }

    return NextResponse.json(
      { message: "Event Created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e: unknown) {
    console.error("Event creation error:", e);
    
    let errorMessage = "Unknown error";
    let errorDetails: Record<string, unknown> = {};
    
    if (e instanceof Error) {
      errorMessage = e.message;
      // Mongoose validation errors
      if ('errors' in e) {
        const mongooseError = e as Error & { errors: Record<string, { message: string }> };
        errorDetails = Object.keys(mongooseError.errors || {}).reduce((acc, key) => {
          acc[key] = mongooseError.errors[key].message;
          return acc;
        }, {} as Record<string, string>);
      }
    } else if (typeof e === 'object' && e !== null) {
      errorMessage = JSON.stringify(e);
    } else {
      errorMessage = String(e);
    }
    
    // Duplicate slug
    if (errorMessage.includes("E11000") && errorMessage.includes("slug")) {
      return NextResponse.json(
        { message: "Duplicate slug", error: "Change title or provide a unique slug" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        message: "Event Creation Failed", 
        error: errorMessage,
        ...(Object.keys(errorDetails).length > 0 && { validation: errorDetails })
      },
      { status: 500 }
    );
  }
}


