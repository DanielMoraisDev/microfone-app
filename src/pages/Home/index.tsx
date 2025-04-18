import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type AudioInputDevice = {
  deviceId: string;
  label: string;
};

function Home() {
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [listening, setListening] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = allDevices
          .filter((device) => device.kind === "audioinput")
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Microfone ${device.deviceId}`,
          }));

        setDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Erro ao acessar microfones:", err);
      }
    };

    loadDevices();
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        },
      });

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Tamanho reduzido para melhorar a performance

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      // Conectar à saída de áudio
      source.connect(audioContext.destination);
      source.connect(analyser); // Somente para análise

      const draw = () => {
        if (!ctx || !canvas) return;

        analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gradiente suave
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "#6EE7B7");
        gradient.addColorStop(1, "#3B82F6");

        ctx.lineWidth = 2;
        ctx.strokeStyle = gradient;
        ctx.shadowColor = "#3B82F6";
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        // Suavização - interpolando pontos
        const smoothness = 0.2; // Controle de suavização
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          const prevY =
            i > 0 ? ((dataArray[i - 1] / 128.0) * canvas.height) / 2 : y;
          const nextY =
            i < bufferLength - 1
              ? ((dataArray[i + 1] / 128.0) * canvas.height) / 2
              : y;

          const smoothedY = prevY + (y - prevY) * smoothness;

          if (i === 0) {
            ctx.moveTo(x, smoothedY);
          } else {
            ctx.lineTo(x, smoothedY);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();

      mediaStreamRef.current = stream;
      audioContextRef.current = audioContext;
      setListening(true);
    } catch (err) {
      console.error("Erro ao iniciar escuta:", err);
    }
  };

  const stopListening = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setListening(false);
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">
        🎙️ Visualizador de Microfone
      </h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Select
            disabled={listening}
            value={selectedDeviceId}
            onValueChange={setSelectedDeviceId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o microfone" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-center">
            <Button onClick={listening ? stopListening : startListening}>
              {listening ? "Parar" : "Iniciar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <canvas
        ref={canvasRef}
        width={300}
        height={70}
        className="w-full rounded-xl border bg-black"
      />
    </main>
  );
}

export default Home;
