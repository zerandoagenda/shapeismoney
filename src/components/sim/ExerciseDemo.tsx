import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function ExerciseDemo({ name, videoPath, imagePath, externalVideo, externalImage }: { name: string; videoPath: string | null; imagePath: string | null; externalVideo: string | null; externalImage: string | null }) {
  const [open, setOpen] = useState(false);
  const [video, setVideo] = useState<string | null>(externalVideo);
  const [image, setImage] = useState<string | null>(externalImage);
  useEffect(() => {
    let live = true;
    void (async () => {
      const [videoResult, imageResult] = await Promise.all([
        videoPath ? supabase.storage.from("exercise-media").createSignedUrl(videoPath, 3600) : Promise.resolve(null),
        imagePath ? supabase.storage.from("exercise-media").createSignedUrl(imagePath, 3600) : Promise.resolve(null),
      ]);
      if (!live) return;
      if (videoResult?.data?.signedUrl) setVideo(videoResult.data.signedUrl);
      if (imageResult?.data?.signedUrl) setImage(imageResult.data.signedUrl);
    })();
    return () => { live = false; };
  }, [videoPath, imagePath]);
  if (!video) return <p className="mt-3 text-xs text-muted-foreground">Demonstração ainda não disponível.</p>;
  return <div className="mt-4">
    {!open ? <Button variant="ghost" className="h-8 text-[10px] border border-primary/20 hover:border-primary/50" onClick={() => setOpen(true)}><Play /> Ver demonstração</Button> : <video className="aspect-video w-full max-w-2xl border border-primary/20 bg-black/40 shadow-2xl" controls preload="metadata" poster={image ?? undefined} aria-label={`Demonstração de ${name}`}><source src={video} /></video>}
  </div>;
}