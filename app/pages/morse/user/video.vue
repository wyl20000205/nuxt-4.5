<template>
  <div id="pages_video">
    <header class="workflow_toolbar">
      <div>
        <h1>江苏久引-视频工作流</h1>
        <p>拖动节点，连接输出点与输入点，然后执行节点</p>
      </div>
      <span class="simulation_badge">
        <em
          role="button"
          tabindex="0"
          title="在画布中央添加节点"
          @click="addNode"
          @keydown.enter.prevent="addNode"
          @keydown.space.prevent="addNode"
          >添加文本节点</em
        >
        <em
          role="button"
          tabindex="0"
          title="添加三维人物状态"
          @click="openThreeDModal()"
          @keydown.enter.prevent="openThreeDModal()"
          @keydown.space.prevent="openThreeDModal()"
        >
          添加三维人物状态
        </em>

        <em
          role="button"
          tabindex="0"
          title="放大画布"
          :class="{ is_disabled: !canZoomIn }"
          :aria-disabled="!canZoomIn"
          @click="zoomIn"
          @keydown.enter.prevent="zoomIn"
          @keydown.space.prevent="zoomIn"
          >放大</em
        >
        <em
          role="button"
          tabindex="0"
          title="缩小画布"
          :class="{ is_disabled: !canZoomOut }"
          :aria-disabled="!canZoomOut"
          @click="zoomOut"
          @keydown.enter.prevent="zoomOut"
          @keydown.space.prevent="zoomOut"
          >缩小</em
        >
        <em role="button" @click="go_user">返回</em>
      </span>
    </header>

    <div ref="viewportRef" class="canvas_viewport">
      <div
        id="video_main"
        ref="canvasRef"
        :style="canvasStyle"
        @pointerdown="cancelConnection"
      >
        <svg
          class="edge_layer"
          aria-hidden="true"
          @pointerdown.self="cancelConnection"
        >
          <g v-for="edge in edges" :key="edge.id">
            <path
              class="edge_path"
              :class="{ is_selected: selectedEdgeId === edge.id }"
              :d="getEdgePath(edge)"
            />
            <path
              class="edge_hit_area"
              :d="getEdgePath(edge)"
              @pointerdown.stop
              @click.stop="selectEdge(edge.id)"
              @dblclick.stop="removeEdge(edge.id)"
            />
          </g>
          <path
            v-if="connecting"
            class="edge_path edge_path_preview"
            :d="getPreviewPath()"
          />
        </svg>

        <button
          v-if="selectedEdge"
          class="edge_disconnect"
          type="button"
          :style="getEdgeButtonStyle(selectedEdge)"
          title="断开这条连接"
          @pointerdown.stop
          @click.stop="removeEdge(selectedEdge.id)"
        >
          断开连接
        </button>

        <article
          v-for="node in nodes"
          :key="node.id"
          class="item"
          :class="[
            `is_${node.status}`,
            { is_dragging: draggingNodeId === node.id },
          ]"
          :data-node-id="node.id"
          :style="{
            transform: `translate(${node.x * zoom}px, ${node.y * zoom}px) scale(${zoom})`,
            height: `${getNodeHeight(node)}px`,
          }"
        >
          <button
            class="connection_point input_point"
            type="button"
            aria-label="输入连接点"
            title="输入连接点"
            @pointerdown.stop
            @pointerup.stop="finishConnection(node.id)"
          />

          <header
            class="item_header"
            @pointerdown="startDragging($event, node)"
          >
            <div class="item_title">
              <span class="status_dot" />
              <strong>{{ node.name }}</strong>
            </div>
            <div class="item_actions" @pointerdown.stop>
              <button
                type="button"
                @click="
                  node.kind === 'threeDState'
                    ? editThreeDState(node)
                    : showTextEditor(node)
                "
              >
                {{
                  node.kind === "threeDState"
                    ? "编辑状态"
                    : node.textVisible
                      ? "编辑文本"
                      : "添加文本"
                }}
              </button>
              <button
                class="run_button"
                type="button"
                :disabled="node.status === 'running'"
                @click="executeNode(node)"
              >
                <i v-if="node.status === 'running'" class="loading_spinner" />
                {{ getRunButtonLabel(node) }}
              </button>
              <button
                class="delete_button"
                type="button"
                @click="removeNode(node.id)"
              >
                删除
              </button>
            </div>
          </header>

          <div class="item_body">
            <button
              v-if="node.kind === 'threeDState'"
              class="state_summary"
              type="button"
              @pointerdown.stop
              @click="editThreeDState(node)"
            >
              <strong>动作提示词</strong>
              <span class="state_prompt">
                {{ node.text || "未填写动作提示词" }}
              </span>
              <small>{{ getPoseSummary(node) }}</small>
            </button>
            <textarea
              v-else-if="node.textVisible"
              v-model="node.text"
              rows="4"
              placeholder="输入这个节点需要执行的命令文本"
              @pointerdown.stop
            />
            <button
              v-else
              class="empty_text"
              type="button"
              @pointerdown.stop
              @click="showTextEditor(node)"
            >
              点击添加节点文本
            </button>

            <div class="execution_result" :class="`result_${node.status}`">
              <span>
                <i v-if="node.status === 'running'" class="loading_spinner" />
                {{ statusLabels[node.status] }}
              </span>
              <p>{{ node.output || "等待执行" }}</p>
            </div>

            <figure v-if="node.imageUrl" class="generated_image">
              <img :src="node.imageUrl" alt="生成结果" draggable="false" />
              <figcaption>生成图片</figcaption>
            </figure>

            <figure v-if="node.videoUrl" class="generated_video">
              <video :src="node.videoUrl" controls preload="metadata" />
              <figcaption>生成视频</figcaption>
            </figure>
          </div>

          <button
            class="connection_point output_point"
            type="button"
            aria-label="输出连接点"
            title="从这里拖动到另一个节点的输入点"
            @pointerdown.stop="startConnection($event, node.id)"
          />
        </article>

        <div v-if="nodes.length === 0" class="empty_canvas">
          当前没有工作流节点
        </div>

        <Transition name="message">
          <div v-if="canvasMessage" class="canvas_message">
            {{ canvasMessage }}
          </div>
        </Transition>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="three_modal">
        <div
          v-if="threeDModalOpen"
          class="three_modal_backdrop"
          @pointerdown.self="closeThreeDModal"
        >
          <section
            class="three_modal_panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="three_modal_title"
          >
            <header class="three_modal_header">
              <div>
                <h2 id="three_modal_title">
                  {{
                    editingThreeDNodeId
                      ? "江苏久引-媒体工作流-编辑三维人物状态"
                      : "江苏久引-媒体工作流-添加三维人物状态"
                  }}
                </h2>
                <p>填写动作提示词，拖动画面观察人物并调整局部关节</p>
              </div>

              <button
                class="three_close_button"
                type="button"
                aria-label="关闭三维人物状态窗口"
                @click="closeThreeDModal"
              >
                ×
              </button>
            </header>

            <div class="three_modal_content">
              <div class="three_preview">
                <div ref="threeHostRef" class="three_host" />
                <span class="three_help"
                  >拖动观察 · 滚轮缩放 · W S A D 移动 · 按住 Ctrl 下蹲</span
                >
              </div>

              <aside class="three_params" aria-label="三维状态参数">
                <h3>局部姿态控制</h3>

                <div class="pose_part_tabs">
                  <button
                    v-for="part in posePartOptions"
                    :key="part.value"
                    type="button"
                    :class="{ is_active: selectedPosePart === part.value }"
                    @click="selectedPosePart = part.value"
                  >
                    {{ part.label }}
                  </button>
                </div>

                <section class="pose_controls">
                  <label
                    v-for="control in activePoseControls"
                    :key="control.key"
                    class="pose_control"
                  >
                    <span>
                      <strong>{{ control.label }}</strong>
                      <output
                        >{{ getPoseControlValue(control.key)
                        }}{{ control.unit }}</output
                      >
                    </span>
                    <input
                      type="range"
                      :aria-label="control.label"
                      :min="control.min"
                      :max="control.max"
                      :step="control.step"
                      :value="getPoseControlValue(control.key)"
                      @input="setPoseControlValue(control.key, $event)"
                    />
                  </label>
                </section>

                <section class="camera_snapshot">
                  <strong>观察参数</strong>
                  <dl>
                    <div>
                      <dt>距离</dt>
                      <dd>{{ threeDParams.camera.distance }}</dd>
                    </div>
                    <div>
                      <dt>方位</dt>
                      <dd>{{ threeDParams.camera.azimuthDegrees }}°</dd>
                    </div>
                    <div>
                      <dt>俯仰</dt>
                      <dd>{{ threeDParams.camera.polarDegrees }}°</dd>
                    </div>
                  </dl>
                </section>
              </aside>
            </div>

            <footer class="three_modal_footer">
              <button type="button" @click="resetThreeView">
                重置姿态与视角
              </button>
              <div class="three_prompt_editor">
                <label for="three_prompt_input">动作提示词</label>
                <input
                  id="three_prompt_input"
                  v-model="threeDPrompt"
                  type="text"
                  maxlength="500"
                  placeholder="输入人物动作，例如：转身并抬起右手挥手"
                  :aria-invalid="Boolean(threeDPromptError)"
                  aria-describedby="three_prompt_help"
                  @input="threeDPromptError = ''"
                />
                <small id="three_prompt_help">
                  {{ threeDPromptError }}
                </small>
              </div>
              <span />
              <button type="button" @click="closeThreeDModal">取消</button>
              <button
                class="three_confirm_button"
                type="button"
                @click="confirmThreeDState"
              >
                {{ editingThreeDNodeId ? "保存状态" : "确定并添加节点" }}
              </button>
            </footer>

            <div class="three_copy_bar">
              <button
                class="three_copy_button"
                type="button"
                @click="copyThreeDStateParameters"
              >
                复制姿态参数
              </button>
              <span role="status" aria-live="polite">
                {{
                  copyPoseFeedback ||
                  "包含人物位置、观察方位、距离、俯视角和全部关节参数"
                }}
              </span>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
   
  type NodeStatus = "idle" | "running" | "success" | "error";

  interface VectorParams {
    x: number;
    y: number;
    z: number;
  }

  interface PoseParams {
    face: {
      eyeHorizontal: number;
      eyeVertical: number;
      mouthVertical: number;
    };
    head: {
      turn: number;
      nod: number;
      tilt: number;
    };
    leftArm: {
      shoulderLift: number;
      shoulderForward: number;
      elbowBend: number;
    };
    rightArm: {
      shoulderLift: number;
      shoulderForward: number;
      elbowBend: number;
    };
    leftLeg: {
      hipForward: number;
      hipOutward: number;
      kneeBend: number;
    };
    rightLeg: {
      hipForward: number;
      hipOutward: number;
      kneeBend: number;
    };
    squat: number;
    leanForward: number;
  }

  interface ThreeDStateParams {
    model: {
      position: VectorParams;
      rotationDegrees: VectorParams;
      scale: VectorParams;
    };
    camera: {
      position: VectorParams;
      target: VectorParams;
      distance: number;
      azimuthDegrees: number;
      polarDegrees: number;
    };
    pose: PoseParams;
  }

  type PosePart =
    | "face"
    | "head"
    | "leftArm"
    | "rightArm"
    | "leftLeg"
    | "rightLeg"
    | "squat"
    | "leanForward";

  interface PoseControl {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
  }

  interface HumanRig {
    root: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    leftEye: THREE.Object3D;
    rightEye: THREE.Object3D;
    mouth: THREE.Object3D;
    leftShoulder: THREE.Group;
    rightShoulder: THREE.Group;
    leftElbow: THREE.Group;
    rightElbow: THREE.Group;
    leftHip: THREE.Group;
    rightHip: THREE.Group;
    leftKnee: THREE.Group;
    rightKnee: THREE.Group;
  }

  interface WorkflowNode {
    id: string;
    name: string;
    x: number;
    y: number;
    text: string;
    textVisible: boolean;
    status: NodeStatus;
    output: string;
    imageUrl: string;
    videoUrl: string;
    kind: "command" | "threeDState";
    threeDState?: ThreeDStateParams;
  }

  interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
  }

  interface ConnectionDraft {
    source: string;
    endX: number;
    endY: number;
  }

  const NODE_WIDTH = 320;
  const NODE_HEIGHT = 220;
  const GENERATED_NODE_HEIGHT = 420;
  const CANVAS_PADDING = 24;
  const CANVAS_MIN_WIDTH = 1100;
  const CANVAS_MIN_HEIGHT = 720;
  const GRID_SIZE = 24;
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 1.6;
  const ZOOM_STEP = 0.1;
  const HUMAN_MOVE_STEP = 0.06;
  const CTRL_SQUAT_AMOUNT = 65;

  const img_settime = 5;
  const video_settime = 60;
  const canvasRef = ref<HTMLElement | null>(null);
  const viewportRef = ref<HTMLElement | null>(null);
  const threeHostRef = ref<HTMLElement | null>(null);
  const threeDModalOpen = ref(false);
  const threeDParams = ref<ThreeDStateParams>(createDefaultThreeDParams());
  const threeDPrompt = ref("");
  const threeDPromptError = ref("");
  const editingThreeDNodeId = ref<string | null>(null);
  const selectedPosePart = ref<PosePart>("face");
  const copyPoseFeedback = ref("");
  const zoom = ref(1);
  const nodes = ref<WorkflowNode[]>([
    {
      id: "node_1",
      name: "节点 1",
      x: 80,
      y: 90,
      text: "生成图片",
      textVisible: true,
      status: "idle",
      output: "",
      imageUrl: "",
      videoUrl: "",
      kind: "command",
    },
    {
      id: "node_2",
      name: "节点 2",
      x: 500,
      y: 90,
      text: "生成视频",
      textVisible: false,
      status: "idle",
      output: "",
      imageUrl: "",
      videoUrl: "",
      kind: "command",
    },
    {
      id: "node_3",
      name: "节点 3",
      x: 290,
      y: 560,
      text: "",
      textVisible: false,
      status: "idle",
      output: "",
      imageUrl: "",
      videoUrl: "",
      kind: "command",
    },
  ]);
  const edges = ref<WorkflowEdge[]>([]);
  const selectedEdgeId = ref<string | null>(null);
  const draggingNodeId = ref<string | null>(null);
  const connecting = ref<ConnectionDraft | null>(null);
  const canvasMessage = ref("");
  const selectedEdge = computed(
    () => edges.value.find((edge) => edge.id === selectedEdgeId.value) ?? null,
  );
  const canZoomIn = computed(() => zoom.value < MAX_ZOOM);
  const canZoomOut = computed(() => zoom.value > MIN_ZOOM);
  const canvasStyle = computed(() => {
    const contentWidth = nodes.value.reduce(
      (maxWidth, node) =>
        Math.max(maxWidth, node.x + NODE_WIDTH + CANVAS_PADDING),
      CANVAS_MIN_WIDTH,
    );
    const contentHeight = nodes.value.reduce(
      (maxHeight, node) =>
        Math.max(maxHeight, node.y + getNodeHeight(node) + CANVAS_PADDING),
      CANVAS_MIN_HEIGHT,
    );
    return {
      minWidth: `${contentWidth * zoom.value}px`,
      minHeight: `${contentHeight * zoom.value}px`,
      backgroundSize: `${GRID_SIZE * zoom.value}px ${GRID_SIZE * zoom.value}px`,
    };
  });

  const statusLabels: Record<NodeStatus, string> = {
    idle: "等待",
    running: "执行中",
    success: "成功",
    error: "失败",
  };

  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let nodeSequence = 3;
  let messageTimer: ReturnType<typeof setTimeout> | undefined;
  let copyPoseTimer: ReturnType<typeof setTimeout> | undefined;
  let squatBeforeControl: number | null = null;
  const executionTimers = new Map<string, ReturnType<typeof setTimeout>>();
  let threeRenderer: THREE.WebGLRenderer | null = null;
  let threeScene: THREE.Scene | null = null;
  let threeCamera: THREE.PerspectiveCamera | null = null;
  let threeControls: OrbitControls | null = null;
  let threeHuman: THREE.Group | null = null;
  let threeHumanRig: HumanRig | null = null;
  let threeResizeObserver: ResizeObserver | null = null;
  let go_user =()=>{
    useRouter().push('/morse/user/')
  }

  const posePartOptions: Array<{ value: PosePart; label: string }> = [
    { value: "face", label: "五官" },
    { value: "head", label: "头部" },
    { value: "leftArm", label: "左臂" },
    { value: "rightArm", label: "右臂" },
    { value: "leftLeg", label: "左腿" },
    { value: "rightLeg", label: "右腿" },
    { value: "squat", label: "蹲下" },
    { value: "leanForward", label: "前倾" },
  ];

  const poseControlGroups: Record<PosePart, PoseControl[]> = {
    face: [
      {
        key: "face.eyeHorizontal",
        label: "眼睛左右",
        min: -0.08,
        max: 0.08,
        step: 0.01,
        unit: "",
      },
      {
        key: "face.eyeVertical",
        label: "眼睛上下",
        min: -0.06,
        max: 0.06,
        step: 0.01,
        unit: "",
      },
      {
        key: "face.mouthVertical",
        label: "嘴部上下",
        min: -0.08,
        max: 0.08,
        step: 0.01,
        unit: "",
      },
    ],
    head: [
      {
        key: "head.turn",
        label: "左右转头",
        min: -55,
        max: 55,
        step: 1,
        unit: "°",
      },
      {
        key: "head.nod",
        label: "抬头低头",
        min: -35,
        max: 35,
        step: 1,
        unit: "°",
      },
      {
        key: "head.tilt",
        label: "左右侧倾",
        min: -25,
        max: 25,
        step: 1,
        unit: "°",
      },
    ],
    leftArm: [
      {
        key: "leftArm.shoulderLift",
        label: "肩部抬起",
        min: -20,
        max: 145,
        step: 1,
        unit: "°",
      },
      {
        key: "leftArm.shoulderForward",
        label: "手臂前后",
        min: -80,
        max: 100,
        step: 1,
        unit: "°",
      },
      {
        key: "leftArm.elbowBend",
        label: "肘部弯曲",
        min: 0,
        max: 145,
        step: 1,
        unit: "°",
      },
    ],
    rightArm: [
      {
        key: "rightArm.shoulderLift",
        label: "肩部抬起",
        min: -20,
        max: 145,
        step: 1,
        unit: "°",
      },
      {
        key: "rightArm.shoulderForward",
        label: "手臂前后",
        min: -80,
        max: 100,
        step: 1,
        unit: "°",
      },
      {
        key: "rightArm.elbowBend",
        label: "肘部弯曲",
        min: 0,
        max: 145,
        step: 1,
        unit: "°",
      },
    ],
    leftLeg: [
      {
        key: "leftLeg.hipForward",
        label: "大腿前后",
        min: -45,
        max: 100,
        step: 1,
        unit: "°",
      },
      {
        key: "leftLeg.hipOutward",
        label: "腿部外展",
        min: -30,
        max: 55,
        step: 1,
        unit: "°",
      },
      {
        key: "leftLeg.kneeBend",
        label: "膝盖弯曲",
        min: 0,
        max: 135,
        step: 1,
        unit: "°",
      },
    ],
    rightLeg: [
      {
        key: "rightLeg.hipForward",
        label: "大腿前后",
        min: -45,
        max: 100,
        step: 1,
        unit: "°",
      },
      {
        key: "rightLeg.hipOutward",
        label: "腿部外展",
        min: -30,
        max: 55,
        step: 1,
        unit: "°",
      },
      {
        key: "rightLeg.kneeBend",
        label: "膝盖弯曲",
        min: 0,
        max: 135,
        step: 1,
        unit: "°",
      },
    ],
    squat: [
      { key: "squat", label: "蹲下程度", min: 0, max: 100, step: 1, unit: "%" },
    ],
    leanForward: [
      {
        key: "leanForward",
        label: "身体前倾",
        min: -20,
        max: 45,
        step: 1,
        unit: "°",
      },
    ],
  };

  const activePoseControls = computed(
    () => poseControlGroups[selectedPosePart.value],
  );

  function createDefaultPose(): PoseParams {
    return {
      face: { eyeHorizontal: 0, eyeVertical: 0, mouthVertical: 0 },
      head: { turn: 0, nod: 0, tilt: 0 },
      leftArm: { shoulderLift: 0, shoulderForward: 0, elbowBend: 0 },
      rightArm: { shoulderLift: 0, shoulderForward: 0, elbowBend: 0 },
      leftLeg: { hipForward: 0, hipOutward: 0, kneeBend: 0 },
      rightLeg: { hipForward: 0, hipOutward: 0, kneeBend: 0 },
      squat: 0,
      leanForward: 0,
    };
  }

  function createDefaultThreeDParams(): ThreeDStateParams {
    return {
      model: {
        position: { x: 0, y: 0, z: 0 },
        rotationDegrees: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      camera: {
        position: { x: 0, y: 1.6, z: 6.8 },
        target: { x: 0, y: 1.15, z: 0 },
        distance: 6.815,
        azimuthDegrees: 0,
        polarDegrees: 86.214,
      },
      pose: createDefaultPose(),
    };
  }

  function getNode(nodeId: string) {
    return nodes.value.find((node) => node.id === nodeId);
  }

  function getNodeHeight(node: WorkflowNode) {
    return node.imageUrl || node.videoUrl ? GENERATED_NODE_HEIGHT : NODE_HEIGHT;
  }

  function toCanvasPoint(event: PointerEvent) {
    const rect = canvasRef.value?.getBoundingClientRect();
    return {
      x: rect ? (event.clientX - rect.left) / zoom.value : 0,
      y: rect ? (event.clientY - rect.top) / zoom.value : 0,
    };
  }

  function startDragging(event: PointerEvent, node: WorkflowNode) {
    if (event.button !== 0) return;
    const point = toCanvasPoint(event);
    draggingNodeId.value = node.id;
    dragOffsetX = point.x - node.x;
    dragOffsetY = point.y - node.y;
    event.preventDefault();
  }

  function handlePointerMove(event: PointerEvent) {
    const point = toCanvasPoint(event);

    if (draggingNodeId.value && canvasRef.value) {
      const node = getNode(draggingNodeId.value);
      if (!node) return;

      const maxX = Math.max(
        CANVAS_PADDING,
        canvasRef.value.clientWidth / zoom.value - NODE_WIDTH - CANVAS_PADDING,
      );
      const maxY = Math.max(
        CANVAS_PADDING,
        canvasRef.value.clientHeight / zoom.value -
          getNodeHeight(node) -
          CANVAS_PADDING,
      );
      node.x = Math.min(Math.max(point.x - dragOffsetX, CANVAS_PADDING), maxX);
      node.y = Math.min(Math.max(point.y - dragOffsetY, CANVAS_PADDING), maxY);
    }

    if (connecting.value) {
      connecting.value.endX = point.x;
      connecting.value.endY = point.y;
    }
  }

  function handlePointerUp() {
    draggingNodeId.value = null;
    connecting.value = null;
  }

  function startConnection(event: PointerEvent, source: string) {
    if (event.button !== 0) return;
    const node = getNode(source);
    if (!node) return;

    connecting.value = {
      source,
      endX: node.x + NODE_WIDTH,
      endY: node.y + getNodeHeight(node) / 2,
    };
    event.preventDefault();
  }

  function finishConnection(target: string) {
    const source = connecting.value?.source;
    if (!source) return;

    if (source === target) {
      showMessage("节点不能连接自己");
      connecting.value = null;
      return;
    }

    const alreadyExists = edges.value.some(
      (edge) => edge.source === source && edge.target === target,
    );
    if (alreadyExists) {
      showMessage("这两个节点已经连接");
      connecting.value = null;
      return;
    }

    const targetHasInput = edges.value.some((edge) => edge.target === target);
    if (targetHasInput) {
      showMessage("一个输入点只能接收一条连线");
      connecting.value = null;
      return;
    }

    const edgeId = `edge_${Date.now()}`;
    edges.value.push({
      id: edgeId,
      source,
      target,
    });
    selectedEdgeId.value = edgeId;
    connecting.value = null;
  }

  function cancelConnection(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      connecting.value = null;
      selectedEdgeId.value = null;
    }
  }

  function makeCurve(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) {
    const distance = Math.max(Math.abs(endX - startX) * 0.5, 80);
    return `M ${startX} ${startY} C ${startX + distance} ${startY}, ${endX - distance} ${endY}, ${endX} ${endY}`;
  }

  function getEdgePath(edge: WorkflowEdge) {
    const source = getNode(edge.source);
    const target = getNode(edge.target);
    if (!source || !target) return "";

    return makeCurve(
      (source.x + NODE_WIDTH) * zoom.value,
      (source.y + getNodeHeight(source) / 2) * zoom.value,
      target.x * zoom.value,
      (target.y + getNodeHeight(target) / 2) * zoom.value,
    );
  }

  function getPreviewPath() {
    const draft = connecting.value;
    if (!draft) return "";
    const source = getNode(draft.source);
    if (!source) return "";

    return makeCurve(
      (source.x + NODE_WIDTH) * zoom.value,
      (source.y + getNodeHeight(source) / 2) * zoom.value,
      draft.endX * zoom.value,
      draft.endY * zoom.value,
    );
  }

  function selectEdge(edgeId: string) {
    selectedEdgeId.value = edgeId;
    connecting.value = null;
  }

  function getEdgeButtonStyle(edge: WorkflowEdge) {
    const source = getNode(edge.source);
    const target = getNode(edge.target);
    if (!source || !target) return {};

    const startX = (source.x + NODE_WIDTH) * zoom.value;
    const startY = (source.y + getNodeHeight(source) / 2) * zoom.value;
    const endX = target.x * zoom.value;
    const endY = (target.y + getNodeHeight(target) / 2) * zoom.value;
    return {
      left: `${(startX + endX) / 2}px`,
      top: `${(startY + endY) / 2}px`,
    };
  }

  function removeEdge(edgeId: string) {
    const edgeExists = edges.value.some((edge) => edge.id === edgeId);
    if (!edgeExists) return;
    edges.value = edges.value.filter((edge) => edge.id !== edgeId);
    if (selectedEdgeId.value === edgeId) selectedEdgeId.value = null;
    showMessage("连接已断开");
  }

  function addNode() {
    nodeSequence += 1;
    const viewport = viewportRef.value;
    const canvas = canvasRef.value;
    const visibleCenterX = viewport
      ? (viewport.scrollLeft + viewport.clientWidth / 2) / zoom.value
      : CANVAS_MIN_WIDTH / 2;
    const visibleCenterY = viewport
      ? (viewport.scrollTop + viewport.clientHeight / 2) / zoom.value
      : CANVAS_MIN_HEIGHT / 2;
    const maxX = Math.max(
      CANVAS_PADDING,
      (canvas?.clientWidth ?? CANVAS_MIN_WIDTH) / zoom.value -
        NODE_WIDTH -
        CANVAS_PADDING,
    );
    const maxY = Math.max(
      CANVAS_PADDING,
      (canvas?.clientHeight ?? CANVAS_MIN_HEIGHT) / zoom.value -
        NODE_HEIGHT -
        CANVAS_PADDING,
    );
    const offset = ((nodeSequence - 1) % 4) * 18;

    nodes.value.push({
      id: `node_${nodeSequence}`,
      name: `节点 ${nodeSequence}`,
      x: Math.min(
        Math.max(visibleCenterX - NODE_WIDTH / 2 + offset, CANVAS_PADDING),
        maxX,
      ),
      y: Math.min(
        Math.max(visibleCenterY - NODE_HEIGHT / 2 + offset, CANVAS_PADDING),
        maxY,
      ),
      text: "",
      textVisible: false,
      status: "idle",
      output: "",
      imageUrl: "",
      videoUrl: "",
      kind: "command",
    });
    showMessage(`已添加节点 ${nodeSequence}`);
  }

  function roundThreeValue(value: number) {
    return Math.round(value * 1000) / 1000;
  }

  function toVectorParams(vector: THREE.Vector3): VectorParams {
    return {
      x: roundThreeValue(vector.x),
      y: roundThreeValue(vector.y),
      z: roundThreeValue(vector.z),
    };
  }

  function addOutlinedHumanPart(
    parent: THREE.Group,
    geometry: THREE.BufferGeometry,
    position: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1],
    color = 0xdde7f8,
    outlined = true,
  ) {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.56,
      metalness: 0.04,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (outlined) {
      const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 24),
        new THREE.LineBasicMaterial({ color: 0x466089 }),
      );
      outline.scale.setScalar(1.012);
      mesh.add(outline);
    }
    parent.add(mesh);
    return mesh;
  }

  function createHumanOutline() {
    const root = new THREE.Group();
    root.name = "three-dimensional-human-state";
    const torso = new THREE.Group();
    root.add(torso);

    addOutlinedHumanPart(
      torso,
      new THREE.CylinderGeometry(0.14, 0.17, 0.25, 18),
      [0, 2.86, 0],
    );
    addOutlinedHumanPart(
      torso,
      new THREE.CylinderGeometry(0.48, 0.66, 1.18, 24),
      [0, 2.19, 0],
    );
    addOutlinedHumanPart(
      torso,
      new THREE.SphereGeometry(0.55, 22, 14),
      [0, 1.48, 0],
      [0, 0, 0],
      [1, 0.56, 0.7],
    );

    const head = new THREE.Group();
    head.position.set(0, 2.92, 0);
    root.add(head);
    addOutlinedHumanPart(
      head,
      new THREE.SphereGeometry(0.36, 24, 18),
      [0, 0.34, 0],
    );
    const leftEye = addOutlinedHumanPart(
      head,
      new THREE.SphereGeometry(0.055, 14, 10),
      [-0.13, 0.4, 0.325],
      [0, 0, 0],
      [1, 1, 0.55],
      0x263552,
      false,
    );
    const rightEye = addOutlinedHumanPart(
      head,
      new THREE.SphereGeometry(0.055, 14, 10),
      [0.13, 0.4, 0.325],
      [0, 0, 0],
      [1, 1, 0.55],
      0x263552,
      false,
    );
    const mouth = addOutlinedHumanPart(
      head,
      new THREE.BoxGeometry(0.16, 0.025, 0.025),
      [0, 0.2, 0.347],
      [0, 0, 0],
      [1, 1, 1],
      0xb85d68,
      false,
    );

    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.58, 2.55, 0);
    root.add(leftShoulder);
    addOutlinedHumanPart(
      leftShoulder,
      new THREE.SphereGeometry(0.18, 16, 12),
      [0, 0, 0],
    );
    addOutlinedHumanPart(
      leftShoulder,
      new THREE.CylinderGeometry(0.14, 0.17, 0.85, 18),
      [0, -0.43, 0],
    );
    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.86, 0);
    leftShoulder.add(leftElbow);
    addOutlinedHumanPart(
      leftElbow,
      new THREE.SphereGeometry(0.145, 16, 12),
      [0, 0, 0],
    );
    addOutlinedHumanPart(
      leftElbow,
      new THREE.CylinderGeometry(0.12, 0.14, 0.82, 18),
      [0, -0.4, 0],
    );
    addOutlinedHumanPart(
      leftElbow,
      new THREE.SphereGeometry(0.15, 18, 12),
      [0, -0.86, 0],
    );

    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.58, 2.55, 0);
    root.add(rightShoulder);
    addOutlinedHumanPart(
      rightShoulder,
      new THREE.SphereGeometry(0.18, 16, 12),
      [0, 0, 0],
    );
    addOutlinedHumanPart(
      rightShoulder,
      new THREE.CylinderGeometry(0.14, 0.17, 0.85, 18),
      [0, -0.43, 0],
    );
    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.86, 0);
    rightShoulder.add(rightElbow);
    addOutlinedHumanPart(
      rightElbow,
      new THREE.SphereGeometry(0.145, 16, 12),
      [0, 0, 0],
    );
    addOutlinedHumanPart(
      rightElbow,
      new THREE.CylinderGeometry(0.12, 0.14, 0.82, 18),
      [0, -0.4, 0],
    );
    addOutlinedHumanPart(
      rightElbow,
      new THREE.SphereGeometry(0.15, 18, 12),
      [0, -0.86, 0],
    );

    const leftHip = new THREE.Group();
    leftHip.position.set(-0.3, 1.35, 0);
    root.add(leftHip);
    addOutlinedHumanPart(
      leftHip,
      new THREE.CylinderGeometry(0.2, 0.17, 1.02, 18),
      [0, -0.51, 0],
    );
    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -1.02, 0);
    leftHip.add(leftKnee);
    addOutlinedHumanPart(
      leftKnee,
      new THREE.SphereGeometry(0.17, 16, 12),
      [0, 0, 0],
    );
    addOutlinedHumanPart(
      leftKnee,
      new THREE.CylinderGeometry(0.16, 0.13, 1.02, 18),
      [0, -0.51, 0],
    );
    addOutlinedHumanPart(
      leftKnee,
      new THREE.BoxGeometry(0.35, 0.2, 0.68),
      [0, -1.1, 0.16],
    );

    const rightHip = new THREE.Group();
    rightHip.position.set(0.3, 1.35, 0);
    root.add(rightHip);
    addOutlinedHumanPart(
      rightHip,
      new THREE.CylinderGeometry(0.2, 0.17, 1.02, 18),
      [0, -0.51, 0],
    );
    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -1.02, 0);
    rightHip.add(rightKnee);
    addOutlinedHumanPart(
      rightKnee,
      new THREE.SphereGeometry(0.17, 16, 12),
      [0, 0, 0],
    );
    addOutlinedHumanPart(
      rightKnee,
      new THREE.CylinderGeometry(0.16, 0.13, 1.02, 18),
      [0, -0.51, 0],
    );
    addOutlinedHumanPart(
      rightKnee,
      new THREE.BoxGeometry(0.35, 0.2, 0.68),
      [0, -1.1, 0.16],
    );

    return {
      root,
      torso,
      head,
      leftEye,
      rightEye,
      mouth,
      leftShoulder,
      rightShoulder,
      leftElbow,
      rightElbow,
      leftHip,
      rightHip,
      leftKnee,
      rightKnee,
    } satisfies HumanRig;
  }

  function cloneThreeDState(state: ThreeDStateParams) {
    const clonedState = JSON.parse(JSON.stringify(state)) as ThreeDStateParams;
    clonedState.pose.leanForward ??= 0;
    return clonedState;
  }

  function getPoseControlValue(key: string) {
    if (key === "squat" || key === "leanForward") {
      return threeDParams.value.pose[key] ?? 0;
    }
    const [group, property] = key.split(".");
    const poseGroup = (
      threeDParams.value.pose as unknown as Record<
        string,
        Record<string, number>
      >
    )[group];
    return poseGroup?.[property] ?? 0;
  }

  function setPoseControlValue(key: string, event: Event) {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    if (key === "squat" || key === "leanForward") {
      threeDParams.value.pose[key] = value;
    } else {
      const [group, property] = key.split(".");
      const poseGroup = (
        threeDParams.value.pose as unknown as Record<
          string,
          Record<string, number>
        >
      )[group];
      if (poseGroup) poseGroup[property] = value;
    }
    applyPoseToRig();
  }

  function applyPoseToRig() {
    if (!threeHumanRig) return;
    const pose = threeDParams.value.pose;
    const degrees = THREE.MathUtils.degToRad;
    const squatRatio = pose.squat / 100;
    const bodyDrop = squatRatio * 0.55;
    const leanRadians = degrees(pose.leanForward ?? 0);
    const upperBodyLean = Math.sin(leanRadians);
    const upperBodyDrop = (1 - Math.cos(leanRadians)) * 0.75;

    threeHumanRig.head.position.set(
      0,
      2.92 - bodyDrop - upperBodyDrop,
      upperBodyLean * 0.75,
    );
    threeHumanRig.head.rotation.set(
      degrees(pose.head.nod),
      degrees(pose.head.turn),
      degrees(pose.head.tilt),
    );
    threeHumanRig.leftEye.position.set(
      -0.13 + pose.face.eyeHorizontal,
      0.4 + pose.face.eyeVertical,
      0.325,
    );
    threeHumanRig.rightEye.position.set(
      0.13 + pose.face.eyeHorizontal,
      0.4 + pose.face.eyeVertical,
      0.325,
    );
    threeHumanRig.mouth.position.set(0, 0.2 + pose.face.mouthVertical, 0.347);

    threeHumanRig.torso.position.y = -bodyDrop;
    threeHumanRig.torso.rotation.x = degrees(
      squatRatio * 10 + (pose.leanForward ?? 0),
    );

    threeHumanRig.leftShoulder.position.set(
      -0.58,
      2.55 - bodyDrop - upperBodyDrop * 0.55,
      upperBodyLean * 0.32,
    );
    threeHumanRig.leftShoulder.rotation.set(
      degrees(-pose.leftArm.shoulderForward),
      0,
      degrees(-pose.leftArm.shoulderLift),
    );
    threeHumanRig.leftElbow.rotation.x = degrees(-pose.leftArm.elbowBend);

    threeHumanRig.rightShoulder.position.set(
      0.58,
      2.55 - bodyDrop - upperBodyDrop * 0.55,
      upperBodyLean * 0.32,
    );
    threeHumanRig.rightShoulder.rotation.set(
      degrees(-pose.rightArm.shoulderForward),
      0,
      degrees(pose.rightArm.shoulderLift),
    );
    threeHumanRig.rightElbow.rotation.x = degrees(-pose.rightArm.elbowBend);

    threeHumanRig.leftHip.position.set(-0.3, 1.35 - bodyDrop, 0);
    threeHumanRig.leftHip.rotation.set(
      degrees(-(pose.leftLeg.hipForward + squatRatio * 35)),
      0,
      degrees(-pose.leftLeg.hipOutward),
    );
    threeHumanRig.leftKnee.rotation.x = degrees(
      pose.leftLeg.kneeBend + squatRatio * 75,
    );

    threeHumanRig.rightHip.position.set(0.3, 1.35 - bodyDrop, 0);
    threeHumanRig.rightHip.rotation.set(
      degrees(-(pose.rightLeg.hipForward + squatRatio * 35)),
      0,
      degrees(pose.rightLeg.hipOutward),
    );
    threeHumanRig.rightKnee.rotation.x = degrees(
      pose.rightLeg.kneeBend + squatRatio * 75,
    );
  }

  function updateThreeDParams() {
    if (!threeCamera || !threeControls || !threeHuman) return;

    threeDParams.value = {
      model: {
        position: toVectorParams(threeHuman.position),
        rotationDegrees: {
          x: roundThreeValue(THREE.MathUtils.radToDeg(threeHuman.rotation.x)),
          y: roundThreeValue(THREE.MathUtils.radToDeg(threeHuman.rotation.y)),
          z: roundThreeValue(THREE.MathUtils.radToDeg(threeHuman.rotation.z)),
        },
        scale: toVectorParams(threeHuman.scale),
      },
      camera: {
        position: toVectorParams(threeCamera.position),
        target: toVectorParams(threeControls.target),
        distance: roundThreeValue(
          threeCamera.position.distanceTo(threeControls.target),
        ),
        azimuthDegrees: roundThreeValue(
          THREE.MathUtils.radToDeg(threeControls.getAzimuthalAngle()),
        ),
        polarDegrees: roundThreeValue(
          THREE.MathUtils.radToDeg(threeControls.getPolarAngle()),
        ),
      },
      pose: cloneThreeDState(threeDParams.value).pose,
    };
  }

  function vectorParameterText(vector: VectorParams) {
    return `X ${vector.x}，Y ${vector.y}，Z ${vector.z}`;
  }

  function buildThreeDParameterText() {
    const { model, camera, pose } = threeDParams.value;
    return [
      "三维人物姿态参数",
      `动作提示词：${threeDPrompt.value.trim() || "未填写"}`,
      `人物位置：${vectorParameterText(model.position)}`,
      `人物旋转：X ${model.rotationDegrees.x}°，Y ${model.rotationDegrees.y}°，Z ${model.rotationDegrees.z}°`,
      `人物缩放：${vectorParameterText(model.scale)}`,
      `观察位置：${vectorParameterText(camera.position)}`,
      `观察目标：${vectorParameterText(camera.target)}`,
      `观察方位：${camera.azimuthDegrees}°`,
      `观察距离：${camera.distance}`,
      `观察俯视角：${camera.polarDegrees}°`,
      `五官：眼睛左右 ${pose.face.eyeHorizontal}，眼睛上下 ${pose.face.eyeVertical}，嘴部上下 ${pose.face.mouthVertical}`,
      `头部：左右转头 ${pose.head.turn}°，抬头低头 ${pose.head.nod}°，左右侧倾 ${pose.head.tilt}°`,
      `左臂：肩部抬起 ${pose.leftArm.shoulderLift}°，手臂前后 ${pose.leftArm.shoulderForward}°，肘部弯曲 ${pose.leftArm.elbowBend}°`,
      `右臂：肩部抬起 ${pose.rightArm.shoulderLift}°，手臂前后 ${pose.rightArm.shoulderForward}°，肘部弯曲 ${pose.rightArm.elbowBend}°`,
      `左腿：大腿前后 ${pose.leftLeg.hipForward}°，腿部外展 ${pose.leftLeg.hipOutward}°，膝盖弯曲 ${pose.leftLeg.kneeBend}°`,
      `右腿：大腿前后 ${pose.rightLeg.hipForward}°，腿部外展 ${pose.rightLeg.hipOutward}°，膝盖弯曲 ${pose.rightLeg.kneeBend}°`,
      `蹲下程度：${pose.squat}%`,
      `身体前倾：${pose.leanForward ?? 0}°`,
    ].join("\n");
  }

  function fallbackCopyText(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }

  async function copyThreeDStateParameters() {
    updateThreeDParams();
    const parameterText = buildThreeDParameterText();
    let copied = false;

    try {
      await navigator.clipboard.writeText(parameterText);
      copied = true;
    } catch {
      copied = fallbackCopyText(parameterText);
    }

    copyPoseFeedback.value = copied ? "完整姿态参数已复制" : "复制失败，请重试";
    if (copyPoseTimer) clearTimeout(copyPoseTimer);
    copyPoseTimer = setTimeout(() => {
      copyPoseFeedback.value = "";
    }, 2200);
  }

  function resizeThreeScene() {
    const host = threeHostRef.value;
    if (!host || !threeRenderer || !threeCamera) return;

    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    threeCamera.aspect = width / height;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(width, height);
  }

  function initializeThreeScene() {
    const host = threeHostRef.value;
    if (!host) return;
    disposeThreeScene();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f8fd);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(
      threeDParams.value.camera.position.x,
      threeDParams.value.camera.position.y,
      threeDParams.value.camera.position.z,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-label", "可旋转的三维人物轮廓");
    renderer.domElement.dataset.threePreview = "human";
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(
      threeDParams.value.camera.target.x,
      threeDParams.value.camera.target.y,
      threeDParams.value.camera.target.z,
    );
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3.4;
    controls.maxDistance = 8.5;
    controls.minPolarAngle = THREE.MathUtils.degToRad(25);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(145);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x74809a, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3.5, 6, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const grid = new THREE.GridHelper(12, 24, 0x9eacc3, 0xd9e0eb);
    grid.position.y = -1.03;
    const gridMaterials = Array.isArray(grid.material)
      ? grid.material
      : [grid.material];
    gridMaterials.forEach((material) => {
      material.opacity = 0.58;
      material.transparent = true;
    });
    scene.add(grid);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 48),
      new THREE.ShadowMaterial({ color: 0x42506a, opacity: 0.14 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.025;
    floor.receiveShadow = true;
    scene.add(floor);

    const humanRig = createHumanOutline();
    humanRig.root.position.set(
      threeDParams.value.model.position.x,
      threeDParams.value.model.position.y,
      threeDParams.value.model.position.z,
    );
    humanRig.root.rotation.set(
      THREE.MathUtils.degToRad(threeDParams.value.model.rotationDegrees.x),
      THREE.MathUtils.degToRad(threeDParams.value.model.rotationDegrees.y),
      THREE.MathUtils.degToRad(threeDParams.value.model.rotationDegrees.z),
    );
    humanRig.root.scale.set(
      threeDParams.value.model.scale.x,
      threeDParams.value.model.scale.y,
      threeDParams.value.model.scale.z,
    );
    scene.add(humanRig.root);

    threeScene = scene;
    threeCamera = camera;
    threeRenderer = renderer;
    threeControls = controls;
    threeHuman = humanRig.root;
    threeHumanRig = humanRig;
    applyPoseToRig();

    controls.addEventListener("change", updateThreeDParams);
    threeResizeObserver = new ResizeObserver(resizeThreeScene);
    threeResizeObserver.observe(host);
    resizeThreeScene();
    controls.update();
    updateThreeDParams();

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });
  }

  function disposeThreeScene() {
    threeResizeObserver?.disconnect();
    threeResizeObserver = null;
    threeControls?.removeEventListener("change", updateThreeDParams);
    threeControls?.dispose();
    threeControls = null;

    if (threeScene) {
      threeScene.traverse((object) => {
        const renderable = object as THREE.Mesh;
        renderable.geometry?.dispose();
        const materials = Array.isArray(renderable.material)
          ? renderable.material
          : renderable.material
            ? [renderable.material]
            : [];
        materials.forEach((material) => material.dispose());
      });
    }

    if (threeRenderer) {
      const canvas = threeRenderer.domElement;
      threeRenderer.setAnimationLoop(null);
      threeRenderer.dispose();
      threeRenderer.forceContextLoss();
      canvas.remove();
    }

    threeRenderer = null;
    threeScene = null;
    threeCamera = null;
    threeHuman = null;
    threeHumanRig = null;
  }

  async function openThreeDModal(nodeId?: string) {
    const node = nodeId ? getNode(nodeId) : undefined;
    editingThreeDNodeId.value = node?.kind === "threeDState" ? node.id : null;
    threeDPrompt.value = node?.kind === "threeDState" ? node.text : "";
    threeDPromptError.value = "";
    threeDParams.value = node?.threeDState
      ? cloneThreeDState(node.threeDState)
      : createDefaultThreeDParams();
    selectedPosePart.value = "face";
    squatBeforeControl = null;
    copyPoseFeedback.value = "";
    threeDModalOpen.value = true;
    await nextTick();

    try {
      initializeThreeScene();
    } catch (error) {
      console.error("初始化三维人物预览失败", error);
      closeThreeDModal();
      showMessage("当前浏览器无法初始化三维人物预览");
    }
  }

  function closeThreeDModal() {
    restoreTemporarySquat();
    disposeThreeScene();
    threeDModalOpen.value = false;
  }

  function editThreeDState(node: WorkflowNode) {
    if (node.kind !== "threeDState") return;
    void openThreeDModal(node.id);
  }

  function resetThreeView() {
    if (!threeCamera || !threeControls || !threeHuman) return;
    squatBeforeControl = null;
    threeDParams.value = createDefaultThreeDParams();
    threeHuman.position.set(0, 0, 0);
    threeHuman.rotation.set(0, 0, 0);
    threeHuman.scale.set(1, 1, 1);
    applyPoseToRig();
    threeCamera.position.set(0, 1.6, 6.8);
    threeControls.target.set(0, 1.15, 0);
    threeControls.update();
    updateThreeDParams();
  }

  function confirmThreeDState() {
    const prompt = threeDPrompt.value.trim();
    if (!prompt) {
      threeDPromptError.value = "请输入人物动作提示词";
      nextTick(() => {
        document
          .querySelector<HTMLTextAreaElement>("#three_prompt_input")
          ?.focus();
      });
      return;
    }

    updateThreeDParams();
    const parameters = JSON.parse(
      JSON.stringify(threeDParams.value),
    ) as ThreeDStateParams;

    let node = editingThreeDNodeId.value
      ? getNode(editingThreeDNodeId.value)
      : undefined;
    const isEditing = Boolean(node);
    if (!node) {
      addNode();
      node = getNode(`node_${nodeSequence}`);
    }
    if (node) {
      node.name = "三维人物状态";
      node.kind = "threeDState";
      node.threeDState = parameters;
      node.text = prompt;
      node.textVisible = false;
      node.output = "三维状态参数已保存";
      node.status = "idle";
      node.videoUrl = "";
    }

    closeThreeDModal();
    editingThreeDNodeId.value = null;
    showMessage(
      isEditing ? "三维人物状态已更新" : "三维人物状态已添加到工作流",
    );
  }

  async function setZoom(nextZoom: number) {
    const viewport = viewportRef.value;
    const oldZoom = zoom.value;
    const normalizedZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.round(nextZoom * 10) / 10),
    );
    if (normalizedZoom === oldZoom) return;

    const centerX = viewport
      ? (viewport.scrollLeft + viewport.clientWidth / 2) / oldZoom
      : 0;
    const centerY = viewport
      ? (viewport.scrollTop + viewport.clientHeight / 2) / oldZoom
      : 0;

    zoom.value = normalizedZoom;
    await nextTick();

    if (viewport) {
      viewport.scrollLeft = Math.max(
        0,
        centerX * normalizedZoom - viewport.clientWidth / 2,
      );
      viewport.scrollTop = Math.max(
        0,
        centerY * normalizedZoom - viewport.clientHeight / 2,
      );
    }
    showMessage(`当前画布比例 ${Math.round(normalizedZoom * 100)}%`);
  }

  function zoomIn() {
    if (canZoomIn.value) void setZoom(zoom.value + ZOOM_STEP);
  }

  function zoomOut() {
    if (canZoomOut.value) void setZoom(zoom.value - ZOOM_STEP);
  }

  function getRunButtonLabel(node: WorkflowNode) {
    if (node.kind === "threeDState") {
      return node.status === "running" ? "生成中" : "生成视频";
    }
    return node.status === "running" ? "执行中" : "执行";
  }

  function getPoseSummary(node: WorkflowNode) {
    const pose = node.threeDState?.pose;
    if (!pose) return "点击编辑人物局部关节";
    const values = [
      ...Object.values(pose.face),
      ...Object.values(pose.head),
      ...Object.values(pose.leftArm),
      ...Object.values(pose.rightArm),
      ...Object.values(pose.leftLeg),
      ...Object.values(pose.rightLeg),
      pose.squat,
      pose.leanForward ?? 0,
    ];
    const adjustedCount = values.filter(
      (value) => Math.abs(value) > 0.001,
    ).length;
    return `已调整 ${adjustedCount} 项，蹲下 ${pose.squat}%，前倾 ${pose.leanForward ?? 0}°`;
  }

  async function showTextEditor(node: WorkflowNode) {
    node.textVisible = true;
    await nextTick();
    canvasRef.value
      ?.querySelector<HTMLTextAreaElement>(
        `[data-node-id="${node.id}"] textarea`,
      )
      ?.focus();
  }

  function executeNode(node: WorkflowNode) {
    if (node.kind === "threeDState") {
      executeThreeDVideo(node);
      return;
    }

    const command = node.text.trim();
    if (!command) {
      node.textVisible = true;
      node.status = "error";
      node.output = "请先输入需要执行的命令文本";
      void showTextEditor(node);
      return;
    }

    const oldTimer = executionTimers.get(node.id);
    if (oldTimer) clearTimeout(oldTimer);

    node.status = "running";
    node.output = "正在生成…";
    node.imageUrl = "";

    const timer = setTimeout(() => {
      const currentNode = getNode(node.id);
      if (!currentNode) return;
      const upstreamOutputs = edges.value
        .filter((edge) => edge.target === node.id)
        .map((edge) => getNode(edge.source)?.output)
        .filter(Boolean);

      currentNode.status = "success";
      currentNode.output = upstreamOutputs.length
        ? `已接收上游结果并生成：${command}`
        : `生成完成：${command}`;
      currentNode.imageUrl = "/images/responce-img.jpg";
      executionTimers.delete(node.id);
    }, img_settime*1000);

    executionTimers.set(node.id, timer);
  }

  function executeThreeDVideo(node: WorkflowNode) {
    const prompt = node.text.trim();
    if (!prompt) {
      node.status = "error";
      node.output = "请先填写人物动作提示词";
      editThreeDState(node);
      return;
    }

    const oldTimer = executionTimers.get(node.id);
    if (oldTimer) clearTimeout(oldTimer);

    node.status = "running";
    node.output = "正在生成视频，请等待几分钟 😋";
    node.imageUrl = "";
    node.videoUrl = "";

    const timer = setTimeout(() => {
      const currentNode = getNode(node.id);
      executionTimers.delete(node.id);
      if (!currentNode) return;

      currentNode.status = "success";
      currentNode.output = `视频生成完成：${prompt}`;
      currentNode.videoUrl = "/video-test-1.mp4";
    }, video_settime * 1000);
    executionTimers.set(node.id, timer);
  }

  function removeNode(nodeId: string) {
    const timer = executionTimers.get(nodeId);
    if (timer) {
      clearTimeout(timer);
      executionTimers.delete(nodeId);
    }
    nodes.value = nodes.value.filter((node) => node.id !== nodeId);
    edges.value = edges.value.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );
    if (
      selectedEdgeId.value &&
      !edges.value.some((edge) => edge.id === selectedEdgeId.value)
    ) {
      selectedEdgeId.value = null;
    }
    if (connecting.value?.source === nodeId) connecting.value = null;
  }

  function restoreTemporarySquat() {
    if (squatBeforeControl === null) return;
    threeDParams.value.pose.squat = squatBeforeControl;
    squatBeforeControl = null;
    applyPoseToRig();
    updateThreeDParams();
  }

  function handleThreeDKeyDown(event: KeyboardEvent) {
    if (!threeDModalOpen.value || !threeHuman) return false;

    if (event.key === "Control") {
      event.preventDefault();
      if (!event.repeat && squatBeforeControl === null) {
        squatBeforeControl = threeDParams.value.pose.squat;
        threeDParams.value.pose.squat = Math.max(
          CTRL_SQUAT_AMOUNT,
          squatBeforeControl,
        );
        applyPoseToRig();
        updateThreeDParams();
      }
      return true;
    }

    const target = event.target as HTMLElement | null;
    if (target?.matches("input, textarea, select, [contenteditable='true']")) {
      return false;
    }

    const movementKey = event.key.toLowerCase();
    if (!["w", "s", "a", "d"].includes(movementKey)) return false;

    event.preventDefault();
    if (movementKey === "w") threeHuman.position.z -= HUMAN_MOVE_STEP;
    if (movementKey === "s") threeHuman.position.z += HUMAN_MOVE_STEP;
    if (movementKey === "a") threeHuman.position.x -= HUMAN_MOVE_STEP;
    if (movementKey === "d") threeHuman.position.x += HUMAN_MOVE_STEP;
    updateThreeDParams();
    return true;
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key !== "Control" || squatBeforeControl === null) return;
    event.preventDefault();
    restoreTemporarySquat();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && threeDModalOpen.value) {
      event.preventDefault();
      closeThreeDModal();
      return;
    }

    if (handleThreeDKeyDown(event)) return;

    if (!selectedEdgeId.value) return;
    const target = event.target as HTMLElement | null;
    if (target?.matches("input, textarea, select, [contenteditable='true']"))
      return;
    if (event.key !== "Delete" && event.key !== "Backspace") return;

    event.preventDefault();
    removeEdge(selectedEdgeId.value);
  }

  function showMessage(message: string) {
    canvasMessage.value = message;
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      canvasMessage.value = "";
    }, 2200);
  }

  onMounted(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", restoreTemporarySquat);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", restoreTemporarySquat);
    if (messageTimer) clearTimeout(messageTimer);
    if (copyPoseTimer) clearTimeout(copyPoseTimer);
    executionTimers.forEach((timer) => clearTimeout(timer));
    disposeThreeScene();
  });
</script>

<style scoped lang="less">
  #pages_video {
    --canvas-border: #dce3ec;
    --text-main: #243044;
    --text-muted: #738096;
    width: 100%;
    height: 100vh;
    min-height: 640px;
    overflow: hidden;
    color: var(--text-main);
    background: #f7f9fc;
  }

  .workflow_toolbar {
    height: 72px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    border-bottom: 1px solid var(--canvas-border);
    background: rgba(255, 255, 255, 0.92);

    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      line-height: 1.2;
    }

    p {
      margin: 0;
      color: var(--text-muted);
      font-size: 12px;
    }
  }

  .simulation_badge {
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    color: #526079;
    font-size: 16px;
    // border: 1px solid #d7dfeb;
    background: #ffffff;
    // box-shadow: 0 3px 10px rgba(45, 60, 85, 0.06);

    em {
      padding: 7px 10px;
      font-style: normal;
      line-height: 1;
      white-space: nowrap;
      border-radius: 100px;
      margin: 0 10px;
      &[role="button"] {
        cursor: pointer;
        border-left: 1px solid #e8edf4;
        transition:
          color 140ms ease,
          background 140ms ease;

        &:hover,
        &:focus-visible {
          color: #2f5fd0;
          outline: none;
          background: #f1f5ff;
        }

        &.is_disabled {
          color: #aeb7c4;
          cursor: not-allowed;
          background: transparent;
        }
      }
    }
  }

  .canvas_viewport {
    height: calc(100vh - 72px);
    min-height: 568px;
    overflow: auto;
  }

  #video_main {
    position: relative;
    min-width: 1100px;
    min-height: 720px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none;
    background-color: #f8fafc;
    background-image:
      linear-gradient(rgba(120, 138, 162, 0.13) 1px, transparent 1px),
      linear-gradient(90deg, rgba(120, 138, 162, 0.13) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .edge_layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: auto;
  }

  .edge_path {
    fill: none;
    stroke: #6688e8;
    stroke-width: 3;
    stroke-linecap: round;
    filter: drop-shadow(0 2px 2px rgba(49, 82, 170, 0.16));
    transition:
      stroke 140ms ease,
      stroke-width 140ms ease;

    &.is_selected {
      stroke: #dc5b63;
      stroke-width: 4;
    }
  }

  .edge_hit_area {
    fill: none;
    stroke: transparent;
    stroke-width: 18;
    cursor: pointer;
    pointer-events: stroke;
  }

  .edge_path_preview {
    stroke: #8ba5ef;
    stroke-dasharray: 7 6;
  }

  .edge_disconnect {
    position: absolute;
    z-index: 5;
    padding: 6px 9px;
    color: #b23e48;
    font-size: 11px;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid #efc7cb;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 5px 16px rgba(77, 43, 49, 0.16);
    transform: translate(-50%, -50%);

    &:hover,
    &:focus-visible {
      color: #ffffff;
      outline: none;
      border-color: #cf4b55;
      background: #cf4b55;
    }
  }

  .item {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 320px;
    height: 220px;
    box-sizing: border-box;
    border: 1px solid #cfd8e6;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(45, 60, 85, 0.1);
    transform-origin: left top;
    transition:
      box-shadow 160ms ease,
      border-color 160ms ease;
    user-select: none;

    &:hover {
      border-color: #9cafdc;
      box-shadow: 0 13px 34px rgba(45, 60, 85, 0.14);
    }

    &.is_dragging {
      z-index: 3;
      cursor: grabbing;
      border-color: #6688e8;
      box-shadow: 0 18px 40px rgba(52, 79, 145, 0.2);
    }
  }

  .item_header {
    height: 54px;
    padding: 0 10px 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    cursor: grab;
    border-bottom: 1px solid #edf0f5;
  }

  .item_title {
    min-width: 68px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    white-space: nowrap;
  }

  .status_dot {
    width: 8px;
    height: 8px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #aab3c1;

    .is_running & {
      background: #e4a52f;
      box-shadow: 0 0 0 4px rgba(228, 165, 47, 0.14);
    }

    .is_success & {
      background: #32a66a;
      box-shadow: 0 0 0 4px rgba(50, 166, 106, 0.14);
    }

    .is_error & {
      background: #dc5b63;
      box-shadow: 0 0 0 4px rgba(220, 91, 99, 0.14);
    }
  }

  .item_actions {
    display: flex;
    align-items: center;
    gap: 4px;

    button {
      padding: 5px 7px;
      color: #526079;
      font-size: 11px;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 5px;
      background: transparent;

      &:hover {
        color: #2f5fd0;
        border-color: #dbe4fa;
        background: #f1f5ff;
      }

      &:disabled {
        cursor: wait;
        opacity: 0.55;
      }
    }

    .run_button {
      color: #2f5fd0;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .delete_button:hover {
      color: #c43f49;
      border-color: #f4d8db;
      background: #fff2f3;
    }
  }

  .item_body {
    min-height: 165px;
    padding: 12px 14px;
    box-sizing: border-box;

    textarea {
      width: 100%;
      height: 76px;
      padding: 9px 10px;
      box-sizing: border-box;
      resize: none;
      color: #2c374a;
      font: inherit;
      font-size: 12px;
      line-height: 1.5;
      outline: none;
      border: 1px solid #d9e0eb;
      border-radius: 7px;
      background: #fbfcfe;
      user-select: text;

      &:focus {
        border-color: #7896e7;
        box-shadow: 0 0 0 3px rgba(102, 136, 232, 0.12);
      }
    }
  }

  .empty_text {
    width: 100%;
    height: 76px;
    color: #8b96a8;
    font-size: 12px;
    cursor: pointer;
    border: 1px dashed #cfd8e6;
    border-radius: 7px;
    background: #fbfcfe;

    &:hover {
      color: #4f70ca;
      border-color: #8fa7e7;
      background: #f5f7ff;
    }
  }

  .state_summary {
    width: 100%;
    height: 76px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 7px;
    color: #53627b;
    text-align: left;
    cursor: pointer;
    border: 1px solid #d7e1f3;
    border-radius: 7px;
    background: #f4f7ff;

    strong {
      color: #3159bf;
      font-size: 12px;
    }

    span {
      font-size: 11px;
    }

    .state_prompt {
      width: 100%;
      overflow: hidden;
      color: #35445e;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    small {
      width: 100%;
      overflow: hidden;
      color: #7a879b;
      font-size: 10px;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover,
    &:focus-visible {
      outline: none;
      border-color: #89a3e7;
      background: #edf2ff;
    }
  }

  .execution_result {
    margin-top: 9px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #68758a;
    font-size: 11px;

    span {
      flex: 0 0 auto;
      padding: 3px 6px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border-radius: 4px;
      background: #eef1f5;
    }

    p {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.result_running span {
      color: #8a6419;
      background: #fff1c9;
    }

    &.result_success span {
      color: #247b50;
      background: #dcf4e8;
    }

    &.result_error span {
      color: #ad3942;
      background: #fde4e6;
    }
  }

  .loading_spinner {
    width: 11px;
    height: 11px;
    display: inline-block;
    flex: 0 0 auto;
    box-sizing: border-box;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: loading_rotate 720ms linear infinite;
  }

  @keyframes loading_rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .generated_image {
    margin: 10px 0 0;
    padding: 7px;
    border: 1px solid #dce3ec;
    border-radius: 8px;
    background: #f4f6f9;

    img {
      display: block;
      width: 100%;
      height: 180px;
      object-fit: contain;
      border-radius: 5px;
      background: #1f2530;
      user-select: none;
    }

    figcaption {
      margin-top: 6px;
      color: #738096;
      font-size: 11px;
      line-height: 1.2;
      text-align: center;
    }
  }

  .generated_video {
    margin: 10px 0 0;
    padding: 7px;
    border: 1px solid #dce3ec;
    border-radius: 8px;
    background: #f4f6f9;

    video {
      display: block;
      width: 100%;
      height: 180px;
      object-fit: contain;
      border-radius: 5px;
      background: #111722;
    }

    figcaption {
      margin-top: 6px;
      color: #738096;
      font-size: 11px;
      line-height: 1.2;
      text-align: center;
    }
  }

  .connection_point {
    position: absolute;
    top: 50%;
    z-index: 4;
    width: 16px;
    height: 16px;
    padding: 0;
    cursor: crosshair;
    border: 3px solid #ffffff;
    border-radius: 50%;
    background: #7891d9;
    box-shadow: 0 0 0 1px #7891d9;
    transform: translateY(-50%);
    transition: transform 120ms ease;

    &:hover {
      transform: translateY(-50%) scale(1.25);
    }
  }

  .input_point {
    left: -8px;
    background: #7b8aa3;
    box-shadow: 0 0 0 1px #7b8aa3;
  }

  .output_point {
    right: -8px;
  }

  .empty_canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    color: #8a96a8;
    font-size: 14px;
    transform: translate(-50%, -50%);
  }

  .canvas_message {
    position: fixed;
    left: 50%;
    bottom: 28px;
    z-index: 10;
    padding: 9px 14px;
    color: #ffffff;
    font-size: 13px;
    border-radius: 7px;
    background: rgba(37, 48, 66, 0.9);
    box-shadow: 0 8px 22px rgba(29, 38, 53, 0.2);
    transform: translateX(-50%);
  }

  .three_modal_backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    padding: 24px;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    background: rgba(24, 34, 50, 0.58);
    backdrop-filter: blur(4px);
  }

  .three_modal_panel {
    width: min(1040px, calc(100vw - 48px));
    max-height: calc(100vh - 48px);
    overflow: hidden;
    color: #243044;
    border: 1px solid rgba(220, 227, 236, 0.9);
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 24px 80px rgba(13, 24, 42, 0.28);
  }

  .three_modal_header {
    min-height: 72px;
    padding: 0 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #e5eaf1;

    h2 {
      margin: 0 0 5px;
      font-size: 18px;
      line-height: 1.2;
    }

    p {
      margin: 0;
      color: #738096;
      font-size: 12px;
    }
  }

  .three_close_button {
    width: 34px;
    height: 34px;
    flex: 0 0 auto;
    color: #637087;
    font-size: 24px;
    line-height: 30px;
    cursor: pointer;
    border: 0;
    border-radius: 8px;
    background: transparent;

    &:hover,
    &:focus-visible {
      color: #27354c;
      outline: none;
      background: #edf1f7;
    }
  }

  .three_modal_content {
    height: min(520px, calc(100vh - 244px));
    min-height: 300px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
  }

  .three_preview {
    position: relative;
    min-width: 0;
    overflow: hidden;
    border-right: 1px solid #e5eaf1;
    background: #f5f8fd;
  }

  .three_host {
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;

    &:active {
      cursor: grabbing;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
    }
  }

  .three_help {
    position: absolute;
    left: 50%;
    bottom: 16px;
    padding: 7px 11px;
    color: #526079;
    font-size: 11px;
    white-space: nowrap;
    pointer-events: none;
    border: 1px solid rgba(207, 216, 230, 0.9);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 4px 15px rgba(48, 64, 90, 0.09);
    transform: translateX(-50%);
  }

  .three_params {
    padding: 18px;
    overflow: auto;
    box-sizing: border-box;
    background: #fbfcfe;

    h3 {
      margin: 0 0 14px;
      font-size: 17px;
    }

    section {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      strong {
        display: block;
        margin-bottom: 7px;
        color: #67748a;
        font-size: 11px;
        font-weight: 600;
      }
    }

    dl {
      margin: 0;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;

      div {
        min-width: 0;
        padding: 7px 8px;
        border: 1px solid #e0e6ef;
        border-radius: 7px;
        background: #ffffff;
      }
    }

    dt {
      margin-bottom: 4px;
      color: #96a0b0;
      font-size: 10px;
    }

    dd {
      margin: 0;
      overflow: hidden;
      color: #31415c;
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .three_prompt_editor {
    position: relative;
    width: min(480px, 40vw);
    display: flex;
    align-items: center;
    gap: 8px;

    label {
      flex: 0 0 auto;
      color: #34435c;
      font-size: 14px;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-width: 0;
      height: 34px;
      padding: 0 10px;
      box-sizing: border-box;
      color: #2c374a;
      font: inherit;
      font-size: 16px;
      outline: none;
      border: 1px solid #d9e0eb;
      border-radius: 7px;
      background: #ffffff;

      &:focus {
        border-color: #7896e7;
        box-shadow: 0 0 0 3px rgba(102, 136, 232, 0.12);
      }

      &[aria-invalid="true"] {
        border-color: #d76670;
        box-shadow: 0 0 0 3px rgba(215, 102, 112, 0.1);
      }
    }

    small {
      position: absolute;
      left: 74px;
      bottom: -15px;
      color: #b43e49;
      font-size: 10px;
      line-height: 1;
      white-space: nowrap;
    }

    input[aria-invalid="false"] + small {
      display: none;
    }
  }

  .pose_part_tabs {
    margin-bottom: 18px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;

    button {
      padding: 7px 4px;
      color: #65738a;
      font-size: 11px;
      cursor: pointer;
      border: 1px solid #dce3ed;
      border-radius: 6px;
      background: #ffffff;

      &:hover,
      &:focus-visible,
      &.is_active {
        color: #3159bf;
        outline: none;
        border-color: #91a9e9;
        background: #edf2ff;
      }

      &.is_active {
        box-shadow: inset 0 0 0 1px rgba(63, 103, 215, 0.2);
      }
    }
  }

  .three_params .pose_controls {
    margin: 0;
    padding: 14px;
    border: 1px solid #e0e6ef;
    border-radius: 9px;
    background: #ffffff;
  }

  .pose_control {
    margin-bottom: 16px;
    display: block;

    &:last-child {
      margin-bottom: 0;
    }

    > span {
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    strong {
      margin: 0 !important;
      color: #53627b !important;
      font-size: 11px !important;
    }

    output {
      color: #3159bf;
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }

    input {
      width: 100%;
      margin: 0;
      cursor: pointer;
      accent-color: #3f67d7;
    }
  }

  .three_params .camera_snapshot {
    margin: 18px 0 0;
    padding-top: 15px;
    border-top: 1px solid #e2e8f0;
  }

  .three_modal_footer {
    min-height: 66px;
    padding: 0 22px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    border-top: 1px solid #e5eaf1;

    span {
      flex: 1;
    }

    button {
      padding: 8px 14px;
      color: #526079;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid #d6deea;
      border-radius: 7px;
      background: #ffffff;

      &:hover,
      &:focus-visible {
        color: #2f5fd0;
        outline: none;
        border-color: #9eb3ec;
        background: #f4f7ff;
      }
    }

    .three_confirm_button {
      color: #ffffff;
      border-color: #3f67d7;
      background: #3f67d7;

      &:hover,
      &:focus-visible {
        color: #ffffff;
        border-color: #3156bd;
        background: #3156bd;
      }
    }
  }

  .three_copy_bar {
    min-height: 50px;
    padding: 0 22px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    color: #738096;
    font-size: 11px;
    border-top: 1px solid #edf0f5;
    background: #fbfcfe;

    span {
      font-size: 18px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .three_copy_button {
    padding: 7px 13px;
    flex: 0 0 auto;
    color: #3159bf;
    font-size: 12px;
    cursor: pointer;
    border: 1px solid #a9bbed;
    border-radius: 7px;
    background: #edf2ff;

    &:hover,
    &:focus-visible {
      color: #2448a5;
      outline: none;
      border-color: #7894df;
      background: #e2eaff;
    }
  }

  .three_modal-enter-active,
  .three_modal-leave-active {
    transition: opacity 180ms ease;

    .three_modal_panel {
      transition: transform 180ms ease;
    }
  }

  .three_modal-enter-from,
  .three_modal-leave-to {
    opacity: 0;

    .three_modal_panel {
      transform: translateY(10px) scale(0.985);
    }
  }

  @media (max-width: 760px) {
    .three_modal_backdrop {
      padding: 12px;
    }

    .three_modal_panel {
      width: calc(100vw - 24px);
      max-height: calc(100vh - 24px);
      overflow: auto;
    }

    .three_modal_content {
      height: auto;
      min-height: 0;
      grid-template-columns: 1fr;
    }

    .three_preview {
      height: 380px;
      border-right: 0;
      border-bottom: 1px solid #e5eaf1;
    }

    .three_params {
      max-height: 260px;
    }

    .three_modal_footer {
      position: sticky;
      bottom: 50px;
      background: #ffffff;
    }

    .three_copy_bar {
      position: sticky;
      bottom: 0;
    }
  }

  .message-enter-active,
  .message-leave-active {
    transition: opacity 160ms ease;
  }

  .message-enter-from,
  .message-leave-to {
    opacity: 0;
  }
</style>
