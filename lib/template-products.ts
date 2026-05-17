import { slugify } from "@/lib/utils";
import type { StoreProduct } from "@/lib/catalog-types";

export const TEMPLATE_PRODUCTS: Array<
  StoreProduct & {
    templateKey: string;
    sourceDir: string;
    assetMode: "scene-pack" | "webcam-only";
  }
> = [
  {
    id: "template-arc-raiders",
    templateKey: "arc-raiders",
    title: "ARC Raiders Wasteland Stream Kit",
    slug: slugify("ARC Raiders Wasteland Stream Kit"),
    description:
      "A premium ARC Raiders-inspired OBS pack built from your real overlay files, including the scene overlay, webcam frame, and Kick nametag. Buyers can enter their stream name on-site and download a personalized package.",
    price: 2500,
    gameCategory: "ARC Raiders",
    overlayType: "Full Stream Pack",
    previewImage: "/generated-previews/template-arc-raiders.svg",
    downloadFilePath: "template-arc-raiders",
    includedFiles: ["Scene overlay HTML/CSS", "Webcam frame HTML/CSS", "Kick nametag HTML/CSS", "Kick status script"],
    ratingAverage: 4.9,
    totalSales: 0,
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCustomizable: true,
    customizationLabel: "Stream name / Kick username",
    sourceDir: "D:/obs-studio/overlays/arc-raiders-overlay",
    assetMode: "scene-pack",
  },
  {
    id: "template-fortnite",
    templateKey: "fortnite",
    title: "Fortnite Victory Stream Kit",
    slug: slugify("Fortnite Victory Stream Kit"),
    description:
      "A Fortnite-inspired stream pack productized from your actual overlay files. Customers can personalize the stream name and receive the scene, webcam frame, and nameplate package ready for OBS browser sources.",
    price: 2500,
    gameCategory: "Fortnite",
    overlayType: "Full Stream Pack",
    previewImage: "/generated-previews/template-fortnite.svg",
    downloadFilePath: "template-fortnite",
    includedFiles: ["Scene overlay HTML/CSS", "Webcam frame HTML/CSS", "Kick nametag HTML/CSS", "Kick status script"],
    ratingAverage: 4.9,
    totalSales: 0,
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCustomizable: true,
    customizationLabel: "Stream name / Kick username",
    sourceDir: "D:/obs-studio/overlays/fortnite-overlay",
    assetMode: "scene-pack",
  },
  {
    id: "template-overwatch",
    templateKey: "overwatch",
    title: "Overwatch Comp Ready Stream Layout",
    slug: slugify("Overwatch Comp Ready Stream Layout"),
    description:
      "A competitive Overwatch-inspired overlay package built from your real scene, webcam, and nametag sources. Buyers personalize the stream name on-site and download an updated OBS browser-source pack.",
    price: 2400,
    gameCategory: "Overwatch",
    overlayType: "Full Stream Pack",
    previewImage: "/generated-previews/template-overwatch.svg",
    downloadFilePath: "template-overwatch",
    includedFiles: ["Scene overlay HTML/CSS", "Webcam frame HTML/CSS", "Kick nametag HTML/CSS", "Kick status script"],
    ratingAverage: 4.8,
    totalSales: 0,
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCustomizable: true,
    customizationLabel: "Stream name / Kick username",
    sourceDir: "D:/obs-studio/overlays/overwatch-overlay",
    assetMode: "scene-pack",
  },
  {
    id: "template-just-chatting",
    templateKey: "just-chatting",
    title: "Just Chatting Neon Webcam Frame",
    slug: slugify("Just Chatting Neon Webcam Frame"),
    description:
      "A clean just chatting webcam frame with a transparent center and premium glow styling. Perfect for browser-source OBS use and ready to download as a polished webcam overlay package.",
    price: 2000,
    gameCategory: "Just Chatting",
    overlayType: "Webcam Overlay",
    previewImage: "/generated-previews/template-just-chatting.svg",
    downloadFilePath: "template-just-chatting",
    includedFiles: ["Webcam frame HTML/CSS"],
    ratingAverage: 4.8,
    totalSales: 0,
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCustomizable: false,
    customizationLabel: "",
    sourceDir: "D:/obs-studio/overlays/just-chatting-overlay",
    assetMode: "webcam-only",
  },
];

export function getTemplateProductBySlug(slug: string) {
  return TEMPLATE_PRODUCTS.find((product) => product.slug === slug) ?? null;
}
