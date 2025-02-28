import { generateVideoThumbnail } from "./video_thumbnail_extractor";

// HTML 생성 및 이벤트 설정
document.addEventListener("DOMContentLoaded", function () {
  const appContainer = document.createElement("div");
  appContainer.className = "thumbnail-generator";
  appContainer.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">비디오 썸네일 생성기</h2>
      
      <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #f9f9f9;">
        <div style="margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #555;">1. 비디오 파일 선택</h3>
          <input type="file" id="videoFile" accept="video/*" style="display: block; margin-bottom: 10px;">
          <div style="font-size: 0.9em; color: #777;">또는 URL 입력:</div>
          <input type="text" id="videoUrl" style="width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box;"
            value="file_example_MP4_480_1_5MG.mp4" 
            placeholder="비디오 URL을 입력하세요 (선택사항)">
        </div>
        
        <div id="videoInfo" style="display: none; margin-bottom: 15px;">
          <div>선택된 비디오: <span id="videoName" style="font-weight: bold;"></span></div>
          <div>재생 시간: <span id="videoDuration" style="font-weight: bold;"></span></div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #555;">2. 썸네일 옵션 설정</h3>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <label for="seekTime" style="margin-right: 10px;">추출 시간(초):</label>
            <input type="number" id="seekTime" style="width: 100px; padding: 8px;" value="0" min="0" step="0.5">
            <button id="previewBtn" style="margin-left: 10px; padding: 8px; background: #f0f0f0; border: 1px solid #ddd; cursor: pointer; display: none;">
              미리보기
            </button>
          </div>
          <div>
            <input type="range" id="seekSlider" style="width: 100%; display: none;" min="0" max="100" value="0">
          </div>
        </div>
        
        <button id="generateBtn" style="padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
          썸네일 생성
        </button>
      </div>
      
      <div id="result" style="display: none; margin-top: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #555;">생성된 썸네일</h3>
        <div style="text-align: center; margin-bottom: 15px;">
          <img id="thumbnailImage" style="max-width: 100%; max-height: 300px; border: 1px solid #ddd;">
        </div>
        <div style="display: flex; justify-content: space-between;">
          <a id="downloadThumbnail" href="#" download="thumbnail.jpg">
            <button style="padding: 8px 15px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
              다운로드
            </button>
          </a>
          <div>
            <label for="fileNameInput" style="margin-right: 10px;">파일 이름:</label>
            <input type="text" id="fileNameInput" value="thumbnail.jpg" style="padding: 8px;">
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(appContainer);

  // 변수 선언
  let selectedFile: File | null | undefined = null;
  let videoDuration = 0;

  // 요소 참조
  const videoFileInput = document.getElementById(
    "videoFile"
  ) as HTMLInputElement;
  const videoUrlInput = document.getElementById("videoUrl") as HTMLInputElement;
  const seekTimeInput = document.getElementById("seekTime") as HTMLInputElement;
  const seekSlider = document.getElementById("seekSlider") as HTMLInputElement;
  const generateBtn = document.getElementById(
    "generateBtn"
  ) as HTMLButtonElement;
  const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement;
  const videoInfo = document.getElementById("videoInfo");
  const videoNameSpan = document.getElementById("videoName");
  const videoDurationSpan = document.getElementById("videoDuration");
  const resultDiv = document.getElementById("result");
  const thumbnailImage = document.getElementById(
    "thumbnailImage"
  ) as HTMLImageElement;
  const downloadLink = document.getElementById(
    "downloadThumbnail"
  ) as HTMLAnchorElement;
  const fileNameInput = document.getElementById(
    "fileNameInput"
  ) as HTMLInputElement;

  videoFileInput?.addEventListener("change", function (e) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const videoInfo = document.getElementById("videoInfo")!;
    const videoName = document.getElementById("videoName")!;
    const videoDuration = document.getElementById("videoDuration")!;

    videoInfo.style.display = "block";
    videoName.textContent = file.name;

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = function () {
      videoDuration.textContent = `${video.duration.toFixed(2)} 초`;
      URL.revokeObjectURL(video.src);
    };
  });

  // 비디오 파일 선택 이벤트
  videoFileInput?.addEventListener("change", function (e) {
    if (!e.target) return;

    selectedFile = (e.target as HTMLInputElement).files?.[0];
    if (selectedFile) {
      // 비디오 정보 표시
      videoNameSpan!.textContent = selectedFile.name;
      videoUrlInput.value = ""; // URL 입력 초기화

      // 비디오 메타데이터 로드
      const tempVideo = document.createElement("video");
      tempVideo.src = URL.createObjectURL(selectedFile);
      tempVideo.addEventListener("loadedmetadata", function () {
        videoDuration = tempVideo.duration;
        videoDurationSpan!.textContent = formatTime(videoDuration);

        // 시간 슬라이더 설정
        seekSlider.min = "0";
        seekSlider.max = videoDuration.toString();
        seekSlider.value = "0";
        seekSlider.style.display = "block";

        // 비디오 정보 및 미리보기 버튼 표시
        if (videoInfo) {
          videoInfo.style.display = "block";
        }
        previewBtn.style.display = "inline-block";

        // 메모리 해제
        URL.revokeObjectURL(tempVideo.src);
      });
      tempVideo.load();
    }
  });

  // 시간 슬라이더 변경 이벤트
  seekSlider?.addEventListener("input", function () {
    seekTimeInput!.value = seekSlider!.value;
  });

  // 시간 입력 변경 이벤트
  seekTimeInput?.addEventListener("input", function () {
    if (seekSlider.style.display !== "none") {
      const value = parseFloat(seekTimeInput.value);
      if (!isNaN(value) && value >= 0 && value <= videoDuration) {
        seekSlider.value = value.toString();
      }
    }
  });

  // 미리보기 버튼 클릭 이벤트
  previewBtn?.addEventListener("click", function () {
    if (selectedFile) {
      const seekTime = parseFloat(seekTimeInput.value) || 0;
      generateThumbnail(selectedFile, seekTime);
    }
  });

  // 썸네일 생성 버튼 클릭 이벤트
  generateBtn?.addEventListener("click", function () {
    const videoUrl = videoUrlInput.value.trim();
    const seekTime = parseFloat(seekTimeInput.value) || 0;

    if (selectedFile) {
      generateThumbnail(selectedFile, seekTime);
    } else if (videoUrl) {
      generateThumbnail(videoUrl, seekTime);
    } else {
      alert("비디오 파일을 선택하거나 URL을 입력해주세요.");
    }
  });

  // 파일 이름 입력 이벤트
  fileNameInput?.addEventListener("input", function () {
    let fileName = fileNameInput.value.trim();
    if (!fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
      fileName += ".jpg";
    }
    downloadLink.download = fileName;
  });

  // 썸네일 생성 함수
  function generateThumbnail(videoSource: File | string, seekTime: number) {
    generateBtn.disabled = true;
    generateBtn.textContent = "처리 중...";

    generateVideoThumbnail(
      videoSource,
      seekTime,
      "image/jpeg",
      0.8,
      function (thumbnailUrl, duration) {
        thumbnailImage!.src = thumbnailUrl;
        downloadLink.href = thumbnailUrl;

        // 파일 이름 설정
        let fileName = "";
        if (selectedFile) {
          const baseName = selectedFile.name.replace(/\.[^/.]+$/, ""); // 확장자 제거
          fileName = `${baseName}_thumbnail.jpg`;
        } else {
          fileName = "thumbnail.jpg";
        }
        fileNameInput.value = fileName;
        downloadLink!.download = fileName;

        resultDiv!.style.display = "block";
        generateBtn.disabled = false;
        generateBtn.textContent = "썸네일 생성";

        // 자동 스크롤
        resultDiv!.scrollIntoView({ behavior: "smooth" });
      }
    );
  }

  // 시간 형식 변환 함수 (초 -> MM:SS)
  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
});
