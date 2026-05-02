// ==========================================
// 1. DOM 요소 선언 및 전역 상태
// ==========================================
const t_h = document.getElementById("t_h");
const t_m = document.getElementById("t_m");
const t_s = document.getElementById("t_s");
const alarmSound = document.getElementById("alarmSound");
const bottomTextContent = document.getElementById("bottomTextContent");

let appliedImages = [];
let draftImages = [];
let selectedDraftImageIndex = -1;

let appliedDialogues = [];
let draftDialogues = [];

let textTimer = null;
let imgTimer = null;
let imgIndex = 0;


// ==========================================
// 2. 제목 (Top Text) & 날짜/시간
// ==========================================
function resizeTopText() {
  topText.style.height = "auto";
  topText.style.height = topText.scrollHeight + "px";
}

topText.addEventListener("input", () => {
  resizeTopText();
  saveAppData();
});

window.addEventListener("load", resizeTopText);

function updateDateTime() {
  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const d = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} (${days[now.getDay()]})`;
  const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  todayDate.innerText = d;
  currentTime.innerText = t;
}

setInterval(updateDateTime, 10000);
updateDateTime();


// ==========================================
// 3. 설정 팝업 제어
// ==========================================
openSettingsPanel.onclick = () => {
  openSettingsPopup();
};

closeSettingsPanel.onclick = () => {
  settingsPanel.style.display = "none";
};

settingsPanel.onclick = () => {}; // 바깥 클릭 닫기 방지

function openSettingsPopup() {
  draftImages = appliedImages.map(item => ({ ...item }));
  draftDialogues = [...appliedDialogues];
  selectedDraftImageIndex = draftImages.length > 0 ? 0 : -1;

  renderDraftImages();
  renderDraftDialogues();

  settingsPanel.style.display = "flex";
}


// ==========================================
// 4. 이미지 설정
// ==========================================
selectImageBtn.onclick = () => {
  popupImageInput.click();
};

popupImageInput.onchange = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  for (const file of files) {
    const dataUrl = await fileToDataUrl(file);
    draftImages.push({ name: file.name, url: dataUrl });
  }

  if (selectedDraftImageIndex === -1 && draftImages.length > 0) {
    selectedDraftImageIndex = 0;
  }

  renderDraftImages();
  popupImageInput.value = "";
};

removeSelectedImageBtn.onclick = () => {
  if (selectedDraftImageIndex < 0 || selectedDraftImageIndex >= draftImages.length) return;

  draftImages.splice(selectedDraftImageIndex, 1);

  if (draftImages.length === 0) {
    selectedDraftImageIndex = -1;
  } else if (selectedDraftImageIndex >= draftImages.length) {
    selectedDraftImageIndex = draftImages.length - 1;
  }
  renderDraftImages();
};

applyImageBtn.onclick = () => {
  appliedImages = draftImages.map(item => ({ ...item }));
  applyImagesToMain();
  saveAppData();
};

function renderDraftImages() {
  imageThumbList.innerHTML = "";
  draftImages.forEach((item, index) => {
    const thumb = document.createElement("div");
    thumb.className = "thumb-item";
    if (index === selectedDraftImageIndex) thumb.classList.add("selected");

    thumb.innerHTML = `<img src="${item.url}" alt="썸네일">`;
    thumb.onclick = () => {
      selectedDraftImageIndex = index;
      renderDraftImages();
    };
    imageThumbList.appendChild(thumb);
  });
}

function applyImagesToMain() {
  clearInterval(imgTimer);
  imgTimer = null;
  imgIndex = 0;

  if (appliedImages.length === 0) {
    displayImage.removeAttribute("src");
    return;
  }

  displayImage.src = appliedImages[0].url;

  if (appliedImages.length > 1) {
    imgTimer = setInterval(() => {
      imgIndex = (imgIndex + 1) % appliedImages.length;
      displayImage.src = appliedImages[imgIndex].url;
    }, 200); // 움짤속도 0.2초
  }
}

displayImage.onclick = () => {
  displayImage.classList.toggle("contain-mode");
  saveAppData();
};


// ==========================================
// 5. 문장 설정
// ==========================================
addDialogueBtn.onclick = () => {
  const text = dialogueInput.value.trim();
  if (!text) return;

  draftDialogues.push(text);
  dialogueInput.value = "";
  renderDraftDialogues();
};

applyDialogueBtn.onclick = () => {
  appliedDialogues = [...draftDialogues];
  applyDialoguesToMain();
  saveAppData();
};

function renderDraftDialogues() {
  dialogueList.innerHTML = "";
  draftDialogues.forEach((text, index) => {
    const chip = document.createElement("div");
    chip.className = "dialogue-chip";
    chip.innerHTML = `
      <div class="dialogue-text"></div>
      <button class="dialogue-remove"></button>
    `;
    chip.querySelector(".dialogue-text").innerText = text;
    chip.querySelector(".dialogue-remove").onclick = () => {
      draftDialogues.splice(index, 1);
      renderDraftDialogues();
    };
    dialogueList.appendChild(chip);
  });
}

function applyDialoguesToMain() {
  clearInterval(textTimer);
  textTimer = null;

  if (appliedDialogues.length === 0) {
    bottomTextContent.innerText = "";
    bottomText.classList.add("empty");
    return;
  }

  bottomTextContent.innerText = appliedDialogues[0];
  bottomText.classList.remove("empty");

  textTimer = setInterval(() => {
    bottomTextContent.innerText = appliedDialogues[Math.floor(Math.random() * appliedDialogues.length)];
    bottomText.classList.remove("empty");
  }, 120000); // 2분마다 갱신
}
bottomText.classList.add("empty");


// ==========================================
// 6. 스톱워치 로직
// ==========================================
let swTime = 0;
let swTimer = null;
let swStartTime = null;

sw_start.onclick = () => {
  if (swTimer) return;
  swStartTime = new Date();
  swTimer = setInterval(() => {
    swTime++;
    sw_display.innerText = formatStopwatchDisplay(swTime);
  }, 1000);

  sw_start.style.display = "none";
  sw_stop.style.display = "inline";
};

sw_stop.onclick = () => {
  clearInterval(swTimer);
  swTimer = null;
  sw_stop.style.display = "none";
  sw_record.style.display = "inline";
  sw_reset.style.display = "inline";
  sw_resume.style.display = "inline";
};

sw_resume.onclick = () => {
  if (swTimer) return;
  swTimer = setInterval(() => {
    swTime++;
    sw_display.innerText = formatStopwatchDisplay(swTime);
  }, 1000);

  sw_stop.style.display = "inline";
  sw_record.style.display = "none";
  sw_reset.style.display = "none";
  sw_resume.style.display = "none";
};

sw_reset.onclick = () => {
  clearInterval(swTimer);
  swTimer = null;
  swTime = 0;
  sw_display.innerText = "00:00";

  sw_start.style.display = "inline";
  sw_stop.style.display = "none";
  sw_record.style.display = "none";
  sw_reset.style.display = "none";
  sw_resume.style.display = "none";
};

sw_record.onclick = () => {
  createRecord("STOPWATCH", formatRecordTime(swTime), "", swStartTime);
};


// ==========================================
// 7. 타이머 로직
// ==========================================
let tTime = 0;
let tRemain = 0;
let tTimer = null;
let tStartTime = null;

function getTimerSeconds() {
  const h = parseInt(t_h.innerText, 10) || 0;
  const m = parseInt(t_m.innerText, 10) || 0;
  const s = parseInt(t_s.innerText, 10) || 0;
  return h * 3600 + m * 60 + s;
}

t_start.onclick = () => {
  if (tTimer) return;
  tTime = getTimerSeconds();
  if (tTime <= 0) return;

  tRemain = tTime;
  tStartTime = new Date();

  t_inputBox.style.display = "none";
  t_display.innerText = formatDisplay(tRemain);
  setEditable(false);

  tTimer = setInterval(() => {
    tRemain--;
    t_display.innerText = formatDisplay(tRemain);

    if (tRemain <= 0) {
      endTimer();
    }
  }, 1000);

  t_start.style.display = "none";
  t_stop.style.display = "inline";
  t_record.style.display = "none";
  t_reset.style.display = "none";
  t_resume.style.display = "none";
};

t_stop.onclick = () => {
  clearInterval(tTimer);
  tTimer = null;
  t_start.style.display = "none";
  t_stop.style.display = "none";
  t_record.style.display = "inline";
  t_reset.style.display = "inline";
  t_resume.style.display = "inline";
};

t_resume.onclick = () => {
  if (tTimer || tRemain <= 0) return;
  tTimer = setInterval(() => {
    tRemain--;
    t_display.innerText = formatDisplay(tRemain);

    if (tRemain <= 0) {
      endTimer();
    }
  }, 1000);

  t_start.style.display = "none";
  t_stop.style.display = "inline";
  t_record.style.display = "none";
  t_reset.style.display = "none";
  t_resume.style.display = "none";
};

t_reset.onclick = () => {
  clearInterval(tTimer);
  tTimer = null;
  tTime = 0;
  tRemain = 0;
  t_display.innerText = "00:00";

  t_inputBox.style.display = "block";
  t_h.innerText = "00";
  t_m.innerText = "00";
  t_s.innerText = "00";
  setEditable(true);

  t_start.style.display = "inline";
  t_stop.style.display = "none";
  t_record.style.display = "none";
  t_reset.style.display = "none";
  t_resume.style.display = "none";
};

t_record.onclick = () => {
  createRecord("TIMER", formatRecordTime(tRemain), formatRecordSubTime(tTime), tStartTime);
};

function endTimer() {
  clearInterval(tTimer);
  tTimer = null;
  tRemain = 0;
  t_display.innerText = formatDisplay(tRemain);

  alarmSound.currentTime = 0;
  alarmSound.play().catch(e => console.log("재생 실패", e));
  alert("종료");

  t_start.style.display = "none";
  t_stop.style.display = "none";
  t_record.style.display = "inline";
  t_reset.style.display = "inline";
  t_resume.style.display = "none";
}


// ==========================================
// 8. 기록 & 메모 생성
// ==========================================
function createRecord(title, time, sub, start) {
  const end = new Date();
  const card = document.createElement("div");
  card.className = "record-card";

  const iconSrc = title === "STOPWATCH" ? "icons/stopwatch.png" : "icons/timer.png";

  card.innerHTML = `
    <div class="record-top-row">
      <div class="record-title" contenteditable="true">${escapeHtml(title)}</div>
      <div class="record-icons">
        <img class="record-type-icon" src="${iconSrc}" alt="${escapeHtml(title)} 아이콘">
        <img class="record-delete-icon" src="icons/delete.png" alt="삭제">
      </div>
    </div>
    ${sub ? `<div class="record-sub"><small>${escapeHtml(sub)}</small></div>` : ""}
    <div class="record-time">${escapeHtml(time)}</div>
    <div class="record-sub">${timeStr(start)} ~ ${timeStr(end)}</div>
  `;

  card.querySelector(".record-title").addEventListener("input", saveAppData);
  card.querySelector(".record-delete-icon").onclick = () => {
    card.remove();
    saveAppData();
  };

  recordList.prepend(card);
  bindRecordEvents();
  saveAppData();
}

const defaultMemoColors = ["#ffffff", "#ffebeb", "#e4f7d9"];
let memoColorSlots = [...defaultMemoColors];
let editingMemoColorIndex = null;

function normalizeHex(value) {
  let hex = value.trim();

  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }

  return hex.toLowerCase();
}

function updateMemoColorButtons() {
  document.querySelectorAll(".memo-color-btn").forEach((btn, index) => {
    btn.style.background = memoColorSlots[index] || defaultMemoColors[index];
  });
}

function replaceMemoColorSlot(index, newColor) {
  memoColorSlots[index] = newColor;
  updateMemoColorButtons();

  document.querySelectorAll(".memo").forEach((memo) => {
    if (String(memo.dataset.colorIndex) === String(index)) {
      memo.dataset.color = newColor;
      memo.style.background = newColor;
    }
  });

  saveAppData();
}

function createMemo(text = "", background = null, isLoading = false, colorIndex = 0) {
  const m = document.createElement("div");
  m.className = "memo";

  if (colorIndex === undefined || colorIndex === null || Number.isNaN(Number(colorIndex))) {
    colorIndex = 0;
  }

  colorIndex = Number(colorIndex);

  if (background === null) {
    background = memoColorSlots[colorIndex] || memoColorSlots[0];
  }

  m.dataset.colorIndex = colorIndex;
  m.dataset.color = background;
  m.style.background = background;

  m.innerHTML = `
    <button class="memo-delete-btn"></button>
    <textarea placeholder="메모 입력"></textarea>
  `;

  const ta = m.querySelector("textarea");
  ta.value = text;

  function resizeMemo() {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

  ta.oninput = () => {
    resizeMemo();
    saveAppData();
  };

  m.onclick = (e) => {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;

    colorIndex = (colorIndex + 1) % memoColorSlots.length;
    m.dataset.colorIndex = colorIndex;
    m.dataset.color = memoColorSlots[colorIndex];
    m.style.background = memoColorSlots[colorIndex];

    saveAppData();
  };

  m.querySelector(".memo-delete-btn").onclick = () => {
    m.remove();
    saveAppData();
  };

  if (isLoading) memoList.appendChild(m);
  else memoList.prepend(m);

  resizeMemo();
}

addMemoBtn.onclick = () => {
  createMemo();
  saveAppData();
};

clearMemoBtn.onclick = () => {
  memoList.innerHTML = "";
  saveAppData();
};

clearRecordBtn.onclick = () => {
  recordList.innerHTML = "";
  saveAppData();
};


// ==========================================
// 9. 캡처 기능
// ==========================================
captureRecordBtn.onclick = () => captureArea(".left", "RECORD");
captureMemoBtn.onclick = () => captureArea(".right", "MEMO");

function captureArea(selector, typeName) {
  const target = document.querySelector(selector);
  const els = target.querySelectorAll("input, textarea");
  const replaced = [];

  const originalStyle = {
    width: target.style.width,
    minWidth: target.style.minWidth,
    maxWidth: target.style.maxWidth,
    padding: target.style.padding,
    boxSizing: target.style.boxSizing,
    overflow: target.style.overflow,
  };

  const captureWidth = 420;
  const capturePadding = 24;

  target.style.width = captureWidth + "px";
  target.style.minWidth = captureWidth + "px";
  target.style.maxWidth = captureWidth + "px";
  target.style.padding = capturePadding + "px";
  target.style.boxSizing = "border-box";
  target.style.overflow = "visible";

  els.forEach((el) => {
    const div = document.createElement("div");
    div.innerText = el.value;
    div.style.whiteSpace = "pre-wrap";
    div.style.wordBreak = "break-word";
    div.style.overflowWrap = "break-word";
    div.style.boxSizing = "border-box";
    div.style.width = "100%";
    div.style.marginBottom = "20px";
    div.style.font = "inherit";
    div.style.lineHeight = "inherit";
    div.style.padding = "24px 0 0 0";
    div.style.border = "none";
    div.style.background = "transparent";

    el.style.display = "none";
    el.parentNode.insertBefore(div, el);
    replaced.push({ el, div });
  });

  html2canvas(target, {
    scale: 2,
    width: captureWidth,
    windowWidth: captureWidth,
    backgroundColor: null,
  }).then((canvas) => {
    download(canvas, typeName);
    replaced.forEach(({ el, div }) => {
      div.remove();
      el.style.display = "block";
    });
    Object.assign(target.style, originalStyle);
  });
}

function download(canvas, typeName) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  
  const a = document.createElement("a");
  a.href = canvas.toDataURL();
  a.download = `${year}.${month}.${date}_${typeName}.png`;
  a.click();
}


// ==========================================
// 10. 유틸리티 및 초기화
// ==========================================
function pad(n) { return String(n).padStart(2, "0"); }

function formatDisplay(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  if (m > 0) return `${pad(m)}:${pad(s)}`;
  return `00:${pad(s)}`;
}

function formatStopwatchDisplay(t) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${pad(m)}:${pad(s)}`;
}

function formatRecordTime(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatRecordSubTime(t) { return formatRecordTime(t); }

function timeStr(d) {
  if (!d) return "";
  const hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, "0");
  const period = hour < 12 ? "오전" : "오후";
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  return `${period} ${displayHour}시 ${minute}분`;
}

function setEditable(state) {
  [t_h, t_m, t_s].forEach(el => { el.contentEditable = state; });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function setupTimeInput(el, max) {
  el.addEventListener("keydown", (e) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab"];
    const isNumberKey = /^[0-9]$/.test(e.key);

    if (!isNumberKey && !allowedKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }

    const text = el.innerText.replace(/\D/g, "");
    const hasSelection = window.getSelection().toString().length > 0;

    if (isNumberKey && text.length >= 2 && !hasSelection) {
      e.preventDefault();
    }
  });

  el.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    el.innerText = pasted.replace(/\D/g, "").slice(0, 2);
    placeCaretAtEnd(el);
  });

  el.addEventListener("input", () => {
    el.innerText = el.innerText.replace(/\D/g, "").slice(0, 2);
    placeCaretAtEnd(el);
  });

  el.addEventListener("blur", () => {
    let v = el.innerText.replace(/\D/g, "");
    if (v === "") {
      el.innerText = "00";
      return;
    }
    let num = parseInt(v, 10);
    if (max !== null && num > max) num = max;
    el.innerText = String(num).padStart(2, "0");
  });
}

function placeCaretAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

setupTimeInput(t_h, null);
setupTimeInput(t_m, 60);
setupTimeInput(t_s, 60);

window.addEventListener("resize", () => {
  document.querySelectorAll(".memo textarea").forEach((ta) => {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  });
});

sw_toggle.onclick = () => {
  const isHidden = sw_content.style.display === "none";
  sw_content.style.display = isHidden ? "block" : "none";
  sw_toggle.classList.toggle("is-collapsed", !isHidden);
};

t_toggle.onclick = () => {
  const isHidden = t_content.style.display === "none";
  t_content.style.display = isHidden ? "block" : "none";
  t_toggle.classList.toggle("is-collapsed", !isHidden);
};

// ==========================================
// 11. 로컬 데이터 관리 & 기본 이미지 적용
// ==========================================
const STORAGE_KEY = "workTimerData";

function saveAppData() {
  const memos = Array.from(document.querySelectorAll(".memo")).map((memo) => {
  return {
    text: memo.querySelector("textarea").value,
    background: memo.dataset.color || memo.style.background || "#ffffff",
    colorIndex: parseInt(memo.dataset.colorIndex || "0", 10)
    };
  });

  const data = {
    topText: topText.value,
    dialogues: appliedDialogues,
    recordsHtml: recordList.innerHTML,
    memos,
    appliedImages,
    memoColorSlots,
    hasSubStopwatch,
    hasSubTimer,
    imageContainMode: displayImage.classList.contains("contain-mode")
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadAppData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const data = JSON.parse(saved);

  if (data.topText !== undefined) topText.value = data.topText;

  if (Array.isArray(data.dialogues)) {
    appliedDialogues = data.dialogues;
    applyDialoguesToMain();
  }

  if (data.recordsHtml) {
    recordList.innerHTML = data.recordsHtml;
    bindRecordEvents();
  }

  if (Array.isArray(data.memoColorSlots)) {
  memoColorSlots = data.memoColorSlots;

  // 컬러칩 반영
  document.querySelectorAll(".memo-color-btn").forEach((btn, i) => {
    btn.style.background = memoColorSlots[i];
  });
  }

  if (Array.isArray(data.memos)) {
    memoList.innerHTML = "";
    data.memos.forEach(item => createMemo(item.text, item.background, true, item.colorIndex ?? 0));
  }

  if (Array.isArray(data.appliedImages) && data.appliedImages.length > 0) {
    appliedImages = data.appliedImages;
    applyImagesToMain();
  }

  if (data.imageContainMode) displayImage.classList.add("contain-mode");
  else displayImage.classList.remove("contain-mode");

  if (data.hasSubStopwatch) {
    hasSubStopwatch = true;
    createSubStopwatch();
    toggleSubStopwatchBtn.innerText = "보조 스톱워치 삭제";
  }

  if (data.hasSubTimer) {
    hasSubTimer = true;
    createSubTimer();
    toggleSubTimerBtn.innerText = "보조 타이머 삭제";
  }
}

function bindRecordEvents() {
  document.querySelectorAll(".record-card").forEach((card) => {
    const titleEl = card.querySelector(".record-title");
    const deleteIcon = card.querySelector(".record-delete-icon");

    if (titleEl) titleEl.oninput = saveAppData;
    if (deleteIcon) {
      deleteIcon.onclick = () => {
        card.remove();
        saveAppData();
      };
    }
  });
}

window.addEventListener("load", async () => {
  loadAppData();

  const extensions = ["png", "jpg", "jpeg", "gif", "webp"];
  const maxCount = 20;
  const candidates = [];

  for (let i = 1; i <= maxCount; i++) {
    extensions.forEach(ext => candidates.push(`images/image${i}.${ext}`));
  }

  const existingImages = await filterExistingImages(candidates);
  const uniqueImages = [];
  const usedIndex = new Set();

  existingImages.forEach((url) => {
    const match = url.match(/image(\d+)\./);
    if (!match) return;
    const index = match[1];
    if (!usedIndex.has(index)) {
      usedIndex.add(index);
      uniqueImages.push(url);
    }
  });

  uniqueImages.sort((a, b) => {
    const aNum = parseInt(a.match(/image(\d+)\./)[1], 10);
    const bNum = parseInt(b.match(/image(\d+)\./)[1], 10);
    return aNum - bNum;
  });

  if (appliedImages.length === 0) {
    appliedImages = uniqueImages.map((url, i) => ({
      name: "image" + (i + 1),
      url
    }));
    applyImagesToMain();
  }
});

function filterExistingImages(urls) {
  return Promise.all(
    urls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    })
  ).then(results => results.filter(Boolean));
}

// ==========================================
// 12. 좌우 패널 접기
// ==========================================
const PANEL_STATE_KEY = "workTimerPanelState";

function savePanelState() {
  const state = {
    leftCollapsed: leftPanel.classList.contains("is-collapsed"),
    rightCollapsed: rightPanel.classList.contains("is-collapsed")
  };

  localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(state));
}

function loadPanelState() {
  const saved = localStorage.getItem(PANEL_STATE_KEY);
  if (!saved) return;

  const state = JSON.parse(saved);

  leftPanel.classList.toggle("is-collapsed", !!state.leftCollapsed);
  rightPanel.classList.toggle("is-collapsed", !!state.rightCollapsed);
}

leftPanelToggle.onclick = () => {
  leftPanel.classList.toggle("is-collapsed");
  savePanelState();
};

rightPanelToggle.onclick = () => {
  rightPanel.classList.toggle("is-collapsed");
  savePanelState();
};

window.addEventListener("load", loadPanelState);

// ==========================================
// 13. 앱 메뉴 & 초기화
// ==========================================
openAppMenuBtn.onclick = () => {
  appMenuPanel.style.display = "flex";
};

appMenuPanel.onclick = (e) => {
  if (e.target === appMenuPanel) {
    appMenuPanel.style.display = "none";
  }
};

resetAppBtn.onclick = () => {
  const ok = confirm("초기화할까요?");

  if (!ok) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PANEL_STATE_KEY);

  location.reload();
};

// ==========================================
// 14. 메모 색상 변경
// ==========================================
document.querySelectorAll(".memo-color-btn").forEach((btn) => {
  btn.onclick = () => {
    editingMemoColorIndex = parseInt(btn.dataset.index, 10);

    memoHexEditor.style.display = "block";
    memoHexInput.value = memoColorSlots[editingMemoColorIndex];
    memoHexInput.focus();
    memoHexInput.select();
  };
});

memoHexInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const newColor = normalizeHex(memoHexInput.value);

  if (!newColor || editingMemoColorIndex === null) {
    memoHexInput.value = "";
    memoHexInput.placeholder = "예: #aee7ff";
    return;
  }

  replaceMemoColorSlot(editingMemoColorIndex, newColor);

  editingMemoColorIndex = null;
  memoHexEditor.style.display = "none";
});

// ==========================================
// 15. 보조 스톱워치
// ==========================================
let hasSubStopwatch = false;
let subSwTime = 0;
let subSwTimer = null;
let subSwStartTime = null;

function createSubStopwatch() {
  subStopwatchContainer.innerHTML = `
    <div class="box" id="subStopwatchBox">
      <div class="box-header">
        <h2>SUB_STOPWATCH</h2>
        <button id="sub_sw_toggle" type="button" class="toggle-icon-btn" aria-label="보조 스톱워치 접기/펼치기"></button>
      </div>

      <div id="sub_sw_content">
        <h1 id="sub_sw_display">00:00</h1>
        <div class="button-row">
          <button id="sub_sw_start">START</button>
          <button id="sub_sw_stop" style="display:none;">Pause</button>
          <button id="sub_sw_record" style="display:none;">Record</button>
          <button id="sub_sw_reset" style="display:none;">Reset</button>
          <button id="sub_sw_resume" style="display:none;">Continue</button>
        </div>
      </div>
    </div>
  `;

  subSwTime = 0;
  subSwTimer = null;
  subSwStartTime = null;

  sub_sw_start.onclick = () => {
    if (subSwTimer) return;

    subSwStartTime = new Date();

    subSwTimer = setInterval(() => {
      subSwTime++;
      sub_sw_display.innerText = formatStopwatchDisplay(subSwTime);
    }, 1000);

    sub_sw_start.style.display = "none";
    sub_sw_stop.style.display = "inline";
  };

  sub_sw_stop.onclick = () => {
    clearInterval(subSwTimer);
    subSwTimer = null;

    sub_sw_stop.style.display = "none";
    sub_sw_record.style.display = "inline";
    sub_sw_reset.style.display = "inline";
    sub_sw_resume.style.display = "inline";
  };

  sub_sw_resume.onclick = () => {
    if (subSwTimer) return;

    subSwTimer = setInterval(() => {
      subSwTime++;
      sub_sw_display.innerText = formatStopwatchDisplay(subSwTime);
    }, 1000);

    sub_sw_stop.style.display = "inline";
    sub_sw_record.style.display = "none";
    sub_sw_reset.style.display = "none";
    sub_sw_resume.style.display = "none";
  };

  sub_sw_reset.onclick = () => {
    clearInterval(subSwTimer);
    subSwTimer = null;
    subSwTime = 0;
    sub_sw_display.innerText = "00:00";

    sub_sw_start.style.display = "inline";
    sub_sw_stop.style.display = "none";
    sub_sw_record.style.display = "none";
    sub_sw_reset.style.display = "none";
    sub_sw_resume.style.display = "none";
  };

  sub_sw_record.onclick = () => {
    createRecord("SUB_STOPWATCH", formatRecordTime(subSwTime), "", subSwStartTime);
  };

  sub_sw_toggle.onclick = () => {
    const isHidden = sub_sw_content.style.display === "none";
    sub_sw_content.style.display = isHidden ? "block" : "none";
    sub_sw_toggle.classList.toggle("is-collapsed", !isHidden);
  };
}

function removeSubStopwatch() {
  clearInterval(subSwTimer);
  subSwTimer = null;
  subSwTime = 0;
  subStopwatchContainer.innerHTML = "";
}

toggleSubStopwatchBtn.onclick = () => {
  hasSubStopwatch = !hasSubStopwatch;

  if (hasSubStopwatch) {
    createSubStopwatch();
    toggleSubStopwatchBtn.innerText = "보조 스톱워치 삭제";
  } else {
    removeSubStopwatch();
    toggleSubStopwatchBtn.innerText = "보조 스톱워치 추가";
  }

  saveAppData();
};

// ==========================================
// 16. 보조 타이머
// ==========================================
let hasSubTimer = false;
let subTTime = 0;
let subTRemain = 0;
let subTTimer = null;
let subTStartTime = null;

function createSubTimer() {
  subTimerContainer.innerHTML = `
    <div class="box" id="subTimerBox">
      <div class="box-header">
        <h2>SUB_TIMER</h2>
        <button id="sub_t_toggle" type="button" class="toggle-icon-btn" aria-label="보조 타이머 접기/펼치기"></button>
      </div>

      <div id="sub_t_content">
        <div id="sub_t_inputBox">
          <span class="time-part" contenteditable="true" id="sub_t_h">00</span>
          <span class="colon">:</span>
          <span class="time-part" contenteditable="true" id="sub_t_m">00</span>
          <span class="colon">:</span>
          <span class="time-part" contenteditable="true" id="sub_t_s">00</span>
        </div>

        <h1 id="sub_t_display">00:00</h1>

        <div class="button-row">
          <button id="sub_t_start">START</button>
          <button id="sub_t_stop" style="display:none;">Pause</button>
          <button id="sub_t_record" style="display:none;">Record</button>
          <button id="sub_t_reset" style="display:none;">Reset</button>
          <button id="sub_t_resume" style="display:none;">Continue</button>
        </div>
      </div>
    </div>
  `;

  function getSubTimerSeconds() {
    const h = parseInt(sub_t_h.innerText, 10) || 0;
    const m = parseInt(sub_t_m.innerText, 10) || 0;
    const s = parseInt(sub_t_s.innerText, 10) || 0;
    return h * 3600 + m * 60 + s;
  }

  sub_t_start.onclick = () => {
    if (subTTimer) return;

    subTTime = getSubTimerSeconds();
    if (subTTime <= 0) return;

    subTRemain = subTTime;
    subTStartTime = new Date();

    sub_t_inputBox.style.display = "none";
    sub_t_display.innerText = formatDisplay(subTRemain);

    subTTimer = setInterval(() => {
      subTRemain--;
      sub_t_display.innerText = formatDisplay(subTRemain);

      if (subTRemain <= 0) {
        clearInterval(subTTimer);
        subTTimer = null;
        subTRemain = 0;
        sub_t_display.innerText = formatDisplay(subTRemain);

        alarmSound.currentTime = 0;
        alarmSound.play().catch(() => {});
        alert("종료");
      }
    }, 1000);

    sub_t_start.style.display = "none";
    sub_t_stop.style.display = "inline";
  };

  sub_t_stop.onclick = () => {
    clearInterval(subTTimer);
    subTTimer = null;

    sub_t_start.style.display = "none";
    sub_t_stop.style.display = "none";
    sub_t_record.style.display = "inline";
    sub_t_reset.style.display = "inline";
    sub_t_resume.style.display = "inline";
  };

  sub_t_resume.onclick = () => {
    if (subTTimer || subTRemain <= 0) return;

    subTTimer = setInterval(() => {
      subTRemain--;
      sub_t_display.innerText = formatDisplay(subTRemain);

      if (subTRemain <= 0) {
        clearInterval(subTTimer);
        subTTimer = null;
        subTRemain = 0;
        sub_t_display.innerText = formatDisplay(subTRemain);

        alarmSound.currentTime = 0;
        alarmSound.play().catch(() => {});
        alert("종료");
      }
    }, 1000);

    sub_t_start.style.display = "none";
    sub_t_stop.style.display = "inline";
    sub_t_record.style.display = "none";
    sub_t_reset.style.display = "none";
    sub_t_resume.style.display = "none";
  };

  sub_t_reset.onclick = () => {
    clearInterval(subTTimer);
    subTTimer = null;
    subTTime = 0;
    subTRemain = 0;
    sub_t_display.innerText = "00:00";

    sub_t_inputBox.style.display = "block";
    sub_t_h.innerText = "00";
    sub_t_m.innerText = "00";
    sub_t_s.innerText = "00";

    sub_t_start.style.display = "inline";
    sub_t_stop.style.display = "none";
    sub_t_record.style.display = "none";
    sub_t_reset.style.display = "none";
    sub_t_resume.style.display = "none";
  };

  sub_t_record.onclick = () => {
    createRecord("SUB_TIMER", formatRecordTime(subTRemain), formatRecordSubTime(subTTime), subTStartTime);
  };

  sub_t_toggle.onclick = () => {
    const isHidden = sub_t_content.style.display === "none";
    sub_t_content.style.display = isHidden ? "block" : "none";
    sub_t_toggle.classList.toggle("is-collapsed", !isHidden);
  };

  setupTimeInput(sub_t_h, null);
  setupTimeInput(sub_t_m, 60);
  setupTimeInput(sub_t_s, 60);
}

function removeSubTimer() {
  clearInterval(subTTimer);
  subTTimer = null;
  subTimerContainer.innerHTML = "";
}

toggleSubTimerBtn.onclick = () => {
  hasSubTimer = !hasSubTimer;

  if (hasSubTimer) {
    createSubTimer();
    toggleSubTimerBtn.innerText = "보조 타이머 삭제";
  } else {
    removeSubTimer();
    toggleSubTimerBtn.innerText = "보조 타이머 추가";
  }

  saveAppData();
};
