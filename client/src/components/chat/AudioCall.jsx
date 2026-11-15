import React, { useEffect, useRef, useState } from "react";
import {
  FiMic,
  FiMicOff,
  FiPhoneOff,
  FiVolume2,
  FiVolumeX,
  FiMoreHorizontal,
  FiArrowLeft,
} from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";

const AudioCall = ({
  authUser,
  callerId,
  callerName,
  callerSignal,
  onEndCall,
  isReceiving,
  calleeId,
  calleeName,
}) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(isReceiving);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(!isReceiving);
  const [callDuration, setCallDuration] = useState(0);
  const [callError, setCallError] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const { socket, incomingIceCandidates } = useSocket();
  const userAudio = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const pendingCandidates = useRef([]);

  useEffect(() => {
    const initCall = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setStream(currentStream);
        streamRef.current = currentStream;

        const iceServers = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
          { urls: "stun:stun.services.mozilla.com" },
          { urls: "stun:stun.cloudflare.com:3478" },
        ];

        if (import.meta.env.VITE_TURN_URL) {
          iceServers.push({
            urls: import.meta.env.VITE_TURN_URL,
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          });
        }

        const peer = new RTCPeerConnection({ iceServers });
        peerRef.current = peer;

        currentStream.getTracks().forEach((track) => {
          peer.addTrack(track, currentStream);
        });

        peer.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (userAudio.current) {
            userAudio.current.srcObject = event.streams[0];
          }
        };

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              to: isReceiving ? callerId : calleeId,
              candidate: event.candidate,
            });
          }
        };

        if (isReceiving) {
          await peer.setRemoteDescription(
            new RTCSessionDescription(callerSignal),
          );

          if (incomingIceCandidates && incomingIceCandidates.length > 0) {
            for (const c of incomingIceCandidates) {
              try {
                await peer.addIceCandidate(new RTCIceCandidate(c));
              } catch (e) {}
            }
          }
          for (const c of pendingCandidates.current) {
            try {
              await peer.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {}
          }
          pendingCandidates.current = [];

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer-call", { to: callerId, signal: answer });
          startTimer();
          setCallAccepted(true);
        } else {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit("call-user", {
            userToCall: calleeId,
            signalData: offer,
            from: authUser._id,
            name: authUser.fullName,
            callType: "audio",
          });
        }
      } catch (err) {
        console.error("AudioCall error:", err);
        setCallError(err.message || "Failed to access microphone");
      }
    };

    initCall();

    const handleCallAccepted = async (signal) => {
      setCallAccepted(true);
      setIsConnecting(false);
      startTimer();
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(signal),
          );
          if (incomingIceCandidates && incomingIceCandidates.length > 0) {
            for (const c of incomingIceCandidates) {
              try {
                await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
              } catch (e) {}
            }
          }
          for (const c of pendingCandidates.current) {
            try {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {}
          }
          pendingCandidates.current = [];
        } catch (e) {
          console.error("Error setting remote description for answer", e);
        }
      }
    };

    const handleIceCandidate = async (candidate) => {
      if (peerRef.current) {
        if (peerRef.current.remoteDescription) {
          try {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(candidate),
            );
          } catch (e) {
            console.error("Error adding received ice candidate", e);
          }
        } else {
          pendingCandidates.current.push(candidate);
        }
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      endCall();
    };
  }, []);

  useEffect(() => {
    if (userAudio.current && remoteStream) {
      userAudio.current.srcObject = remoteStream;
      const playPromise = userAudio.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) =>
          console.warn("Audio autoplay policy prevented auto-start:", e),
        );
      }
    }
  }, [remoteStream, callAccepted]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    onEndCall();
  };

  const leaveCall = () => {
    socket.emit("end-call", { to: isReceiving ? callerId : calleeId });
    endCall();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    if (userAudio.current) {
      userAudio.current.muted = isSpeakerOn;
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  const displayName = isReceiving ? callerName : calleeName;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0E0C15] flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden h-[100dvh]">
      {/* Background ambient purple lighting (Figma Screen 27) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-[#6D28D9]/25 via-[#7C3AED]/20 to-[#8B5CF6]/15 rounded-full blur-[140px] pointer-events-none" />

      <audio ref={userAudio} autoPlay />

      {/* Top Header / Back Button (Figma Screen 27) */}
      <div className="w-full flex items-center justify-between pt-2 sm:pt-4 z-10 max-w-md">
        <button
          onClick={leaveCall}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          title="Back"
        >
          <FiArrowLeft size={18} />
        </button>
        <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest">
          Audio Call
        </span>
        <div className="w-10" />
      </div>

      {/* Center Caller Info, Avatar & Waveform (Figma Screen 27) */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4 w-full max-w-sm z-10">
        {callError ? (
          <div className="p-6 rounded-3xl w-full border border-rose-500/30 bg-rose-950/40 text-rose-300">
            <h2 className="text-lg sm:text-xl font-bold mb-2">{callError}</h2>
            <p className="text-sm text-white/70">
              Please allow microphone permissions in your browser settings to
              make audio calls.
            </p>
          </div>
        ) : (
          <>
            {/* Profile Avatar with Purple Glowing Ring */}
            <div className="relative mb-6">
              <div className="absolute inset-0 -m-3 rounded-full bg-[#7C3AED]/30 blur-xl animate-pulse" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] shadow-2xl shadow-purple-600/40">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      displayName || "User",
                    )}&background=1E1B4B&color=C4B5FD`}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Caller Name */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 truncate max-w-full drop-shadow-md">
              {displayName}
            </h2>

            {/* Call Duration / Status */}
            <p className="text-sm font-medium text-gray-400 font-mono mb-6">
              {callAccepted
                ? formatDuration(callDuration)
                : isConnecting
                  ? "Connecting..."
                  : "Ringing..."}
            </p>

            {/* Animated Purple Soundwave Visualizer (Figma Screen 27) */}
            <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-[200px]">
              {[0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.3, 0.7, 0.5, 0.8, 0.4].map(
                (scale, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-[#6D28D9] to-[#A78BFA]"
                    style={{
                      height: `${Math.max(12, scale * 40)}px`,
                      animation: callAccepted
                        ? `pulse 1.2s ease-in-out ${i * 0.1}s infinite alternate`
                        : "none",
                      opacity: callAccepted ? 1 : 0.4,
                    }}
                  />
                ),
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls Bar (Figma Screen 27: Speaker, Mic, More, End Call) */}
      <div className="flex items-center justify-center gap-5 sm:gap-6 px-6 py-4 rounded-full border border-white/10 mb-6 sm:mb-10 z-10 bg-white/[0.05] backdrop-blur-2xl">
        {/* Speaker / Volume */}
        <button
          onClick={toggleSpeaker}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 border cursor-pointer ${
            !isSpeakerOn
              ? "bg-purple-900/60 text-purple-200 border-purple-500/40"
              : "bg-white/10 hover:bg-white/20 text-white border-white/10"
          }`}
          title={isSpeakerOn ? "Mute Speaker" : "Unmute Speaker"}
        >
          {isSpeakerOn ? (
            <FiVolume2 className="text-xl" />
          ) : (
            <FiVolumeX className="text-xl" />
          )}
        </button>

        {/* Microphone */}
        <button
          onClick={toggleMute}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 border cursor-pointer ${
            isMuted
              ? "bg-rose-500/80 hover:bg-rose-500 text-white border-rose-400/50 shadow-lg shadow-rose-500/30"
              : "bg-white/10 hover:bg-white/20 text-white border-white/10"
          }`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? (
            <FiMicOff className="text-xl" />
          ) : (
            <FiMic className="text-xl" />
          )}
        </button>

        {/* More Options */}
        <button
          onClick={() => toast("Audio call options: Standard HD audio stream")}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 border border-white/10 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          title="More Options"
        >
          <FiMoreHorizontal className="text-xl" />
        </button>

        {/* Red End Call Button (Figma Screen 27) */}
        <button
          onClick={leaveCall}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-105 active:scale-95 transition-all border border-red-400/40 cursor-pointer"
          title="End Call"
        >
          <FiPhoneOff className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default AudioCall;