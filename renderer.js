const screenMenu = document.getElementById('screen-menu'),
  screenCanvas = document.getElementById('screen-canvas'),
  courseListDiv = document.getElementById('course-list'),
  menuTitle = document.querySelector('#screen-menu h2'),
  backButton = document.getElementById('back-button'),
  backToStartButton = document.getElementById('back-to-start-button'),
  clearButton = document.getElementById('clear-button'),
  penButton = document.getElementById('pen-button'),
  eraserButton = document.getElementById('eraser-button'),
  lineButton = document.getElementById('line-button'),
  stampButton = document.getElementById('stamp-button'),
  textButton = document.getElementById('text-button'),
  toolButtons = document.querySelectorAll('.tool-button'),
  penControls = document.getElementById('pen-controls'),
  eraserControls = document.getElementById('eraser-controls'),
  lineControls = document.getElementById('line-controls'),
  penColorButtons = document.querySelectorAll('.pen-color'),
  lineColorButtons = document.querySelectorAll('.line-color'),
  penSizeSlider = document.getElementById('pen-size-slider'),
  penSizePreview = document.getElementById('pen-size-preview'),
  eraserSizeSlider = document.getElementById('eraser-size-slider'),
  eraserSizePreview = document.getElementById('eraser-size-preview'),
  lineSizeSlider = document.getElementById('line-size-slider'),
  lineSizePreview = document.getElementById('line-size-preview'),
  stampSelectionPanel = document.getElementById('stamp-selection-panel'),
  stampImages = document.querySelectorAll('.stamp-image');

const routeTitle = document.getElementById('route-title');

let quill = null;

const courseData = [
  { id: 1, name: 'マリオブラザーズサーキット', connections: [2, 3, 5, 6, 7, 25, 26] },
  { id: 2, name: 'トロフィーシティ', connections: [1, 3, 4, 5, 7, 13, 14, 15, 24, 25] },
  { id: 3, name: 'シュポポコースター', connections: [1, 2, 4, 5, 13, 25] },
  { id: 4, name: 'DKうちゅうセンター', connections: [1, 2, 3, 5, 13, 15] },
  { id: 5, name: 'サンサンさばく', connections: [1, 2, 3, 6, 13] },
  { id: 6, name: 'ヘイホーカーニバル', connections: [1, 5, 7, 8, 25] },
  { id: 7, name: 'ワリオスタジアム', connections: [1, 2, 6, 8, 23, 25, 26, 27] },
  { id: 8, name: 'キラーシップ', connections: [6, 7, 23, 26, 27] },
  { id: 9, name: 'DKスノーマウンテン', connections: [10, 11, 12, 17, 20, 21, 24] },
  { id: 10, name: 'ロゼッタてんもんだい', connections: [9, 11, 12, 20, 21, 22, 29] },
  { id: 11, name: 'アイスビルディング', connections: [9, 10, 12, 17, 20, 21] },
  { id: 12, name: 'ワリオシップ', connections: [9, 10, 11, 16, 17, 20] },
  { id: 13, name: 'ノコノコビーチ', connections: [2, 4, 14, 15, 18] },
  { id: 14, name: 'リバーサイドサファリ', connections: [2, 13, 15, 16, 17, 18, 19, 20] },
  { id: 15, name: 'ピーチスタジアム', connections: [2, 13, 14, 20, 24, 25, 26, 30] },
  { id: 16, name: 'ピーチビーチ', connections: [12, 14, 17, 18, 19] },
  { id: 17, name: 'ソルティータウン', connections: [9, 12, 14, 16, 18, 19, 20] },
  { id: 18, name: 'ディノディノジャングル', connections: [13, 14, 16, 17, 19] },
  { id: 19, name: 'ハテナしんでん', connections: [13, 14, 16, 17, 18] },
  { id: 20, name: 'プクプクフォールズ', connections: [9, 10, 12, 14, 15, 17, 21, 24, 25] },
  { id: 21, name: 'ショーニューロード', connections: [9, 10, 11, 20, 22, 24, 26, 28, 29 ] },
  { id: 22, name: 'おばけシネマ', connections: [10, 21, 23, 28, 29,] },
  { id: 23, name: 'ホネホネツイスター', connections: [7, 8, 22, 24, 26, 27, 28, 29] },
  { id: 24, name: 'モーモーカントリー', connections: [2, 9, 15, 20, 21, 23, 25, 26, 29] },
  { id: 25, name: 'チョコマウンテン', connections: [1, 2, 3, 6, 7, 15, 20, 24, 26, 27] },
  { id: 26, name: 'キノピオファクトリー', connections: [1, 7, 8, 15, 21, 23, 24, 25, 27, 28, 29] },
  { id: 27, name: 'クッパキャッスル', connections: [7, 8, 23, 25, 26, 29] },
  { id: 28, name: 'どんぐりツリーハウス', connections: [21, 22, 23, 26, 29] },
  { id: 29, name: 'マリオサーキット', connections: [10, 15, 21, 22, 23, 24, 26, 27, 28] },
  { id: 30, name: 'レインボーロード', connections: [] }
];

const courses = courseData.map(course => ({
  ...course,
  icon: `./images/course-icons/${course.id}.png`
}));


let startCourseId = null;
let endCourseId = null;

let stage = null, drawLayer = null, objectsLayer = null, uiLayer = null, tr = null, isPaint = false, lastLine;
let currentMode = 'pen';
let currentPenColor = 'black', currentLineColor = 'black', currentPenSize = 5, currentEraserSize = 20, currentLineSize = 5;

function getCurrentRouteKey() {
  if (!startCourseId || !endCourseId) return null;
  return `canvas_${startCourseId}-${endCourseId}`;
}

function autoSaveCanvas() {
  const key = getCurrentRouteKey();
  if (!key || !drawLayer || !objectsLayer) return;
  const data = { draw: drawLayer.toJSON(), obj: objectsLayer.toJSON() };
  localStorage.setItem(key, JSON.stringify(data));
  console.log(`キャンバスの状態を ${key} に自動保存しました。`);
}

function getCurrentMemoKey() {
  if (!startCourseId || !endCourseId) return null;
  return `memo_${startCourseId}-${endCourseId}`;
}

async function initializeMemoEditor() {
  const memoContainer = document.getElementById('memo-container');
  const memoEditor = document.getElementById('memo-editor');

  memoContainer.querySelectorAll('.ql-toolbar').forEach(el => el.remove());

  memoContainer.querySelectorAll('.ql-container').forEach(el => {
    if (el !== memoEditor) el.remove();
  });

  memoEditor.innerHTML = '';
  quill = null;

  const toolbarOptions = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }],
    ['clean']
  ];

  quill = new window.Quill('#memo-editor', {
    modules: { toolbar: toolbarOptions },
    theme: 'snow'
  });

  const key = getCurrentMemoKey();
  const savedMemo = localStorage.getItem(key);
  if (savedMemo) {
    try { quill.setContents(JSON.parse(savedMemo)); } catch (_) {}
  }

  quill.on('text-change', () => {
    const k = getCurrentMemoKey();
    if (k) localStorage.setItem(k, JSON.stringify(quill.getContents()));
  });
}

function distPointToSeg(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1, vy = y2 - y1;
  const wx = px - x1, wy = py - y1;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - x1, py - y1);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - x2, py - y2);
  const b = c1 / c2;
  const bx = x1 + b * vx, by = y1 + b * vy;
  return Math.hypot(px - bx, py - by);
}
function circleIntersectsRect(cx, cy, r, rect) {
  const rx = rect.x, ry = rect.y, rw = rect.width, rh = rect.height;
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  return Math.hypot(cx - nx, cy - ny) <= r;
}

function eraseAt(pos) {
  const radius = Number(currentEraserSize) / 2;

  objectsLayer.find(node => node instanceof Konva.Image || node instanceof Konva.Text)
    .forEach(node => {
      const rect = node.getClientRect();
      if (circleIntersectsRect(pos.x, pos.y, radius, rect)) {
        if (tr && tr.nodes().includes(node)) tr.nodes([]);
        node.destroy();
      }
    });

  drawLayer.find('Line').forEach(line => {
    const pts = line.points();
    const half = (Number(line.strokeWidth()) || 0) / 2;
    const threshold = radius + half;
    for (let i = 0; i + 3 < pts.length; i += 2) {
      const d = distPointToSeg(pos.x, pos.y, pts[i], pts[i + 1], pts[i + 2], pts[i + 3]);
      if (d <= threshold) {
        line.destroy();
        break;
      }
    }
  });

  drawLayer.batchDraw();
  objectsLayer.batchDraw();
}

function handleResize() {
  if (!stage) return;
  const container = document.getElementById('editor-canvas-container');
  stage.width(container.clientWidth);
  stage.height(container.clientHeight);
  const backgroundLayer = stage.findOne('#background-layer');
  if (!backgroundLayer) return;
  const bgImage = backgroundLayer.findOne('Image');
  if (bgImage) {
    const image = bgImage.image && bgImage.image();
    if (image) {
      const scale = stage.height() / image.height;
      bgImage.scale({ x: scale, y: scale });
    }
  }
}

function initializeCanvas() {
  if (stage) stage.destroy();

  const container = document.getElementById('editor-canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  stage = new Konva.Stage({ container: 'editor-canvas-container', width, height });

  const backgroundLayer = new Konva.Layer({ id: 'background-layer' });
  stage.add(backgroundLayer);

  const key = getCurrentRouteKey();
  const saved = key ? localStorage.getItem(key) : null;
  let savedData = null;
  try { savedData = saved ? JSON.parse(saved) : null; } catch (_) {}

  if (savedData && savedData.draw) {
    drawLayer = Konva.Node.create(savedData.draw);
    drawLayer.setAttr('id', 'main-layer');
    drawLayer.find('Transformer').forEach(n => n.destroy());
    stage.add(drawLayer);
  } else {
    drawLayer = new Konva.Layer({ id: 'main-layer' });
    stage.add(drawLayer);
  }

  if (savedData && savedData.obj) {
    objectsLayer = Konva.Node.create(savedData.obj);
    objectsLayer.setAttr('id', 'objects-layer');
    stage.add(objectsLayer);

    objectsLayer.find('Image').forEach(imageNode => {
      const imageSrc = imageNode.id();
      if (imageSrc) {
        const imageElement = new Image();
        imageElement.src = imageSrc;
        imageElement.onload = () => {
          imageNode.image(imageElement);
        };
      }
    });
  } else {
    objectsLayer = new Konva.Layer({ id: 'objects-layer' });
    stage.add(objectsLayer);
  }

  uiLayer = new Konva.Layer({ id: 'ui-layer' });
  stage.add(uiLayer);

  tr = new Konva.Transformer({
    nodes: [],
    keepRatio: true,
    anchorCornerRadius: 5,
    anchorStroke: '#4f8dff',
    anchorFill: 'white',
    borderStroke: '#4f8dff',
    rotateEnabled: false
  });
  uiLayer.add(tr);

  const imagePath = `./cources/${startCourseId}~${endCourseId}.png`;
  Konva.Image.fromURL(
    imagePath,
    (bgImage) => {
      const scale = stage.height() / bgImage.height();
      bgImage.setAttrs({ x: 0, y: 0, scaleX: scale, scaleY: scale, listening: false });
      backgroundLayer.destroyChildren();
      backgroundLayer.add(bgImage);
    },
    () => {
      console.log(`背景画像 ${imagePath} が見つかりませんでした。`);
      backgroundLayer.destroyChildren();
    }
  );

  objectsLayer.find('Image, Text').forEach(node => {
    if (node.draggable && node.draggable()) addSelectAndEditEvents(node);
  });

  tr.on('transformend', function () {
    const selectedNode = tr.nodes()[0];
    if (selectedNode && selectedNode instanceof Konva.Text) {
      const newFontSize = Math.round(selectedNode.fontSize() * selectedNode.scaleX());
      selectedNode.fontSize(newFontSize);
      selectedNode.scaleX(1);
      selectedNode.scaleY(1);
    }
    autoSaveCanvas();
  });

  stage.on('click tap', (e) => { if (e.target === stage) tr.nodes([]); });

  stage.on('mousedown', (e) => {
    const layerOfTarget = (e.target && typeof e.target.getLayer === 'function') ? e.target.getLayer() : null;
    const onUILayer = !!(layerOfTarget && typeof layerOfTarget.id === 'function' && layerOfTarget.id() === 'ui-layer');

    if (currentMode === 'select' || currentMode === 'stamp' || currentMode === 'text' || (e.target !== stage && !onUILayer)) {
      isPaint = false; return;
    }

    isPaint = true;
    const pos = stage.getPointerPosition();

    if (currentMode === 'eraser') {
      eraseAt(pos);
    } else {
      const props = { lineCap: 'round', lineJoin: 'round' };
      if (currentMode === 'line') {
        Object.assign(props, { stroke: currentLineColor, strokeWidth: currentLineSize, points: [pos.x, pos.y, pos.x, pos.y] });
      } else {
        Object.assign(props, { stroke: currentPenColor, strokeWidth: currentPenSize, points: [pos.x, pos.y] });
      }
      lastLine = new Konva.Line(props);
      drawLayer.add(lastLine);
    }
  });

  stage.on('mousemove', (e) => {
    if (!isPaint) return;
    const pos = stage.getPointerPosition();

    if (currentMode === 'eraser') {
      eraseAt(pos);
    } else if (currentMode === 'line') {
      const points = lastLine.points();
      points[2] = pos.x; points[3] = pos.y;
      lastLine.points(points);
    } else {
      const newPoints = lastLine.points().concat([pos.x, pos.y]);
      lastLine.points(newPoints);
    }
  });

  stage.on('mouseup', () => { if (isPaint) autoSaveCanvas(); isPaint = false; });
}

function addSelectAndEditEvents(node) {
  node.on('click tap', () => { tr.nodes([node]); uiLayer.batchDraw(); });
  node.on('dragend', autoSaveCanvas);
  if (node instanceof Konva.Text) {
    node.on('dblclick dbltap', () => { editText(node); });
  }
}

function addStamp(imageSrc) {
  Konva.Image.fromURL(imageSrc, (imageNode) => {
    imageNode.setAttrs({
      x: 100, y: 100, width: 50, height: 50, draggable: true,
      id: imageSrc
    });
    objectsLayer.add(imageNode);
    addSelectAndEditEvents(imageNode);
    autoSaveCanvas();
  });
}

function editText(textNode) {
  tr.nodes([]);
  const oldTextarea = document.getElementById('text-editor');
  if (oldTextarea) oldTextarea.remove();

  const textarea = document.createElement('textarea');
  document.body.appendChild(textarea);

  const textPosition = textNode.getAbsolutePosition();
  const stageBox = stage.container().getBoundingClientRect();

  textarea.value = textNode.text();
  textarea.id = 'text-editor';
  textarea.style.top = (stageBox.top + textPosition.y) + 'px';
  textarea.style.left = (stageBox.left + textPosition.x) + 'px';
  textarea.style.width = textNode.width() + 'px';
  textarea.style.height = textNode.height() + 'px';
  textarea.focus();

  function updateText() {
    if (!document.body.contains(textarea)) return;
    document.body.removeChild(textarea);

    if (textarea.value.trim()) {
      textNode.text(textarea.value);
    } else {
      textNode.destroy();
    }

    autoSaveCanvas();
  }

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) updateText();
    if (e.key === 'Escape') { if (document.body.contains(textarea)) document.body.removeChild(textarea); }
  });
  textarea.addEventListener('blur', updateText);
}

clearButton.addEventListener('click', () => {
  if (!confirm('キャンバスの内容をすべて削除しますか？')) return;
  tr.nodes([]);
  if (drawLayer) drawLayer.destroyChildren();
  if (objectsLayer) objectsLayer.destroyChildren();
  autoSaveCanvas();
});

function setActiveTool(selectedButton) {
  if (selectedButton && selectedButton.classList.contains('active')) {
    currentMode = 'select';
    toolButtons.forEach(button => button.classList.remove('active'));
  } else {
    toolButtons.forEach(button => button.classList.remove('active'));
    if (selectedButton) selectedButton.classList.add('active');
  }

  const id = selectedButton ? selectedButton.id : '';
  penControls.classList.toggle('hidden', id !== 'pen-button');
  eraserControls.classList.toggle('hidden', id !== 'eraser-button');
  lineControls.classList.toggle('hidden', id !== 'line-button');
  if (id !== 'stamp-button') stampSelectionPanel.classList.add('hidden');
}

function handleToolClick(e, mode) {
  const button = e.currentTarget;
  if (button.classList.contains('active')) {
    currentMode = 'select';
    setActiveTool(null);
  } else {
    currentMode = mode;
    setActiveTool(button);
    if (mode === 'stamp') stampSelectionPanel.classList.remove('hidden');
  }
}

penButton.addEventListener('click', (e) => handleToolClick(e, 'pen'));
eraserButton.addEventListener('click', (e) => handleToolClick(e, 'eraser'));
lineButton.addEventListener('click', (e) => handleToolClick(e, 'line'));

stampButton.addEventListener('click', (e) => {
  const button = e.currentTarget;
  if (button.classList.contains('active') && !stampSelectionPanel.classList.contains('hidden')) {
    currentMode = 'select';
    setActiveTool(null);
    stampSelectionPanel.classList.add('hidden');
  } else {
    currentMode = 'stamp';
    setActiveTool(button);
    stampSelectionPanel.classList.remove('hidden');
  }
});

textButton.addEventListener('click', (e) => {
  handleToolClick(e, 'text');
  if (currentMode === 'text') {
    const textNode = new Konva.Text({ text: 'テキスト', x: 50, y: 50, fontSize: 30, draggable: true, fill: currentPenColor });
    objectsLayer.add(textNode);
    addSelectAndEditEvents(textNode);
    tr.nodes([textNode]);
    autoSaveCanvas();
  }
});

stampImages.forEach(image => {
  image.addEventListener('click', () => {
    addStamp(image.dataset.src);
    stampSelectionPanel.classList.add('hidden');
  });
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const selectedNodes = tr.nodes();
    if (selectedNodes.length > 0) {
      selectedNodes.forEach(node => node.destroy());
      tr.nodes([]);
      autoSaveCanvas();
    }
  }
});

penColorButtons.forEach(button => { button.addEventListener('click', () => { currentPenColor = button.dataset.color; updatePenSizePreview(); }); });
lineColorButtons.forEach(button => { button.addEventListener('click', () => { currentLineColor = button.dataset.color; updateLineSizePreview(); }); });
penSizeSlider.addEventListener('input', (e) => { currentPenSize = e.target.value; updatePenSizePreview(); });
eraserSizeSlider.addEventListener('input', (e) => { currentEraserSize = e.target.value; updateEraserSizePreview(); });
lineSizeSlider.addEventListener('input', (e) => { currentLineSize = e.target.value; updateLineSizePreview(); });

function updatePenSizePreview() {
  penSizePreview.style.backgroundColor = currentPenColor;
  penSizePreview.style.width = `${currentPenSize}px`;
  penSizePreview.style.height = `${currentPenSize}px`;
}
function updateEraserSizePreview() {
  eraserSizePreview.style.width = `${currentEraserSize}px`;
  eraserSizePreview.style.height = `${currentEraserSize}px`;
}
function updateLineSizePreview() {
  lineSizePreview.style.backgroundColor = currentLineColor;
  lineSizePreview.style.width = `${currentLineSize}px`;
  lineSizePreview.style.height = `${currentLineSize}px`;
}

function displayCourses(courseArray) {
  courseListDiv.innerHTML = '';
  courseArray.forEach(course => {
    const button = document.createElement('button');
    button.classList.add('course-button');
    button.dataset.courseId = course.id;
    button.title = course.name;

    button.innerHTML = `
      <img src="${course.icon}" alt="${course.name}">
      <span>${course.name}</span>
    `;

    button.addEventListener('click', handleCourseClick);
    courseListDiv.appendChild(button);
  });
}

function showEndpointSelection() {
  const startCourse = courses.find(c => c.id === startCourseId);
  const connectedCourses = startCourse.connections
    .map(connectionId => courses.find(c => c.id === connectionId))
    .filter(c => c);
  menuTitle.textContent = '終点コースを選択';
  displayCourses(connectedCourses);
  backToStartButton.classList.remove('hidden');
}

function handleCourseClick(event) {
  const clickedCourseId = parseInt(event.currentTarget.dataset.courseId);
  if (startCourseId === null) {
    startCourseId = clickedCourseId;
    showEndpointSelection();
  } else {
    endCourseId = clickedCourseId;

    const startCourseName = courses.find(c => c.id === startCourseId).name;
    const endCourseName = courses.find(c => c.id === endCourseId).name;

    routeTitle.textContent = `${startCourseName} → ${endCourseName}`;

    console.log(`始点: ${startCourseId}, 終点: ${endCourseId}`);
    screenMenu.classList.add('hidden');
    screenCanvas.classList.remove('hidden');
    initializeCanvas();
    initializeMemoEditor();
    setActiveTool(penButton);
  }
}

backToStartButton.addEventListener('click', () => {
  startCourseId = null; endCourseId = null;
  if (stage) { stage.destroy(); stage = null; }
  menuTitle.textContent = '始点コースを選択';
  displayCourses(courses);
  backToStartButton.classList.add('hidden');
});

backButton.addEventListener('click', () => {
  endCourseId = null;
  if (stage) { stage.destroy(); stage = null; }
  screenCanvas.classList.add('hidden');
  screenMenu.classList.remove('hidden');
  showEndpointSelection();
});

window.addEventListener('resize', handleResize);
window.addEventListener('DOMContentLoaded', () => {
  displayCourses(courses);
  updatePenSizePreview();
  updateEraserSizePreview();
  updateLineSizePreview();
});