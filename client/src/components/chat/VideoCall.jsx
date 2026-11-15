import React, { useEffect, useRef, useState } from "react";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";

const VideoCall = ({
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
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(!isReceiving);
  const [callError, setCallError] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [iceState, setIceState] = useState("new");

  const { socket, incomingIceCandidates } = useSocket();
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const userVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const pendingCandidates = useRef([]);

  useEffect(() => {
    const initCall = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(currentStream);
        streamRef.current = currentStream;

        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

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
          console.log("WebRTC: Remote track received!", event.streams[0]);
          setRemoteStream(event.streams[0]);
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
          }
        };

        peer.oniceconnectionstatechange = () => {
          console.log("ICE State:", peer.iceConnectionState);
          setIceState(peer.iceConnectionState);
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

          // Drain any candidates that arrived before modal mounted
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
          socket.emit("answer-call", { signal: answer, to: callerId });
          setIsConnecting(false);
        } else {
          const offer = await peer.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
          await peer.setLocalDescription(offer);
          socket.emit("call-user", {
            userToCall: calleeId,
            signalData: offer,
            from: authUser._id,
            name: authUser.fullName,
            isVideoCall: true,
          });
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setCallError("Camera or Microphone access denied/unavailable.");
        toast.error("Permissions denied. Check your camera/mic.");
      }
    };

    initCall();

    const handleCallAccepted = async (signal) => {
      setCallAccepted(true);
      setIsConnecting(false);
      if (peerRef.current && !peerRef.current.currentRemoteDescription) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(signal),
        );

        // Drain buffered candidates received from the Callee
        for (const c of pendingCandidates.current) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
          } catch (e) {}
        }
        pendingCandidates.current = [];
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

  // Safely attach stream to video element when it mounts
  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
      const playPromise = remoteVideo.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) =>
          console.warn("Autoplay policy prevented auto-start:", e),
        );
      }
    }
  }, [remoteStream, callAccepted]);

  const endCall = () => {
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

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0E0C15] flex items-center justify-center overflow-hidden select-none">
      <div className="relative w-full h-[100dvh] md:max-w-6xl md:h-[90vh] md:p-4 flex flex-col">
        {/* Top-Left Back Button (Figma Screen 28) */}
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={leaveCall}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15 backdrop-blur-md"
            title="Back"
          >
            <FiArrowLeft size={18} />
          </button>
        </div>

        {/* Remote Video or Status Screen */}
        <div className="flex-1 w-full h-full relative bg-[#12111A] md:rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center border border-white/10">
          {callError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-rose-400 bg-rose-950/20 p-6 text-center">
              <FiVideoOff className="w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold">{callError}</h2>
              <p className="mt-2 text-sm sm:text-base text-white/60 max-w-sm">
                Check browser permissions or ensure a camera/mic is connected.
              </p>
            </div>
          ) : callAccepted ? (
            <>
              <video
                playsInline
                ref={remoteVideo}
                autoPlay
                className="w-full h-full object-cover"
              />
              {iceState !== "connected" && iceState !== "completed" && (
                <div className="absolute top-4 left-16 z-20 text-white px-3.5 py-1.5 rounded-full text-xs font-mono border border-white/15 flex items-center gap-2 shadow-lg bg-black/60 backdrop-blur-md">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      iceState === "failed" || iceState === "disconnected"
                        ? "bg-rose-400 animate-ping"
                        : "bg-amber-400 animate-pulse"
                    }`}
                  />
                  <span>Network: {iceState}...</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#7C3AED]/25 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-28 sm:w-36 h-28 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] shadow-2xl shadow-purple-600/40">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        calleeName || "User",
                      )}&background=1E1B4B&color=C4B5FD`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">
                {calleeName}
              </h2>
              <p className="text-sm font-medium text-purple-300 font-mono px-4 py-1 rounded-full border border-purple-400/30 bg-purple-950/40 mt-1">
                {isConnecting
                  ? `Connecting to ${calleeName}...`
                  : `Calling ${calleeName}...`}
              </p>
            </div>
          )}
        </div>

        {/* Local Video (Floating Picture-in-Picture) - Figma Screen 28 */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-24 sm:w-36 md:w-44 aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#7C3AED]/60 backdrop-blur-md z-30 transition-all duration-200">
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>

        {/* Controls Bar (Figma Screen 28: Switch Camera, Mic, Video, End Call) */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 sm:gap-5 px-6 sm:px-8 py-3.5 rounded-full shadow-2xl border border-white/15 bg-black/60 backdrop-blur-2xl">
          {/* Switch Camera */}
          <button
            onClick={() => toast("Camera flip not supported on desktop browser")}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border border-white/10 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title="Flip Camera"
          >
            <FiRefreshCw className="text-lg" />
          </button>

          {/* Microphone */}
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border cursor-pointer ${
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

          {/* Camera / Video */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border cursor-pointer ${
              isVideoOff
                ? "bg-rose-500/80 hover:bg-rose-500 text-white border-rose-400/50 shadow-lg shadow-rose-500/30"
                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
            }`}
            title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
            {isVideoOff ? (
              <FiVideoOff className="text-xl" />
            ) : (
              <FiVideo className="text-xl" />
            )}
          </button>

          {/* Red End Call Button (Figma Screen 28) */}
          <button
            onClick={leaveCall}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-105 active:scale-95 transition-all border border-red-400/40 cursor-pointer"
            title="End Call"
          >
            <FiPhoneOff className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
