/**
 * 비디오에서 썸네일을 생성하는 함수
 * @param videoSource 비디오 파일 또는 URL
 * @param seekTime 썸네일 추출 시간 (초)
 * @param type 이미지 타입 (기본값: image/jpeg)
 * @param quality 이미지 품질 (기본값: 0.8)
 * @param callback 썸네일 생성 후 호출할 콜백 함수
 */

export function asyncGenerateVideoThumbnail(
  videoSource: File | string,
  seekTime = 0,
  type = "image/jpeg",
  quality = 0.8
): Promise<{ url: string; duration: number }> {
  return new Promise((resolve) => {
    generateVideoThumbnail(
      videoSource,
      seekTime,
      type,
      quality,
      (url, duration) => {
        resolve({ url, duration });
      }
    );
  });
}

export function generateVideoThumbnail(
  videoSource: File | string,
  seekTime = 0,
  type = "image/jpeg",
  quality = 0.8,
  callback: (url: string, duration: number) => void
) {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  if (videoSource instanceof File) {
    video.src = URL.createObjectURL(videoSource);
  } else if (typeof videoSource === "string") {
    video.crossOrigin = "anonymous";
    video.src = videoSource;
  } else {
    console.error("비디오 소스는 파일 또는 URL이어야 합니다.");
    throw new Error("비디오 소스 오류");
  }

  // 메타데이터 로드 이벤트
  video.addEventListener("loadedmetadata", function () {
    // 비디오 시간을 설정한 seekTime으로 이동
    video.currentTime = seekTime < video.duration ? seekTime : 0;
  });

  // seekTime으로 이동 후 이벤트
  video.addEventListener("seeked", function () {
    // 캔버스 생성
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 비디오 프레임을 캔버스에 그리기
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 썸네일 이미지 URL 생성
    const thumbnailUrl = canvas.toDataURL(type, quality);
    callback(thumbnailUrl, video.duration);

    // 메모리 해제
    video.pause();

    // ObjectURL인 경우 해제
    if (videoSource instanceof File) {
      URL.revokeObjectURL(video.src);
    }

    video.remove();

    // video.src = "";
    // video.load();
  });

  // 오류 처리
  video.addEventListener("error", function () {
    console.error("비디오 로드 오류:", video.error);
    throw new Error("비디오 로드 오류", { cause: video.error });
  });
}
