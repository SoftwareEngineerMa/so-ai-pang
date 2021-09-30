/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismFramework, Option } from '@framework/live2dcubismframework';

import * as LAppDefine from './lappdefine';
import { HxpMManager } from './hxpMManager';
import { HxpTimer } from './hxpTimer';
import { HxpTexture } from './hxpTexture';
import { HxpView } from './hxpView';

export let canvas: HTMLCanvasElement = null;
export let s_instance: HxpAgent = null;
export let gl: WebGLRenderingContext = null;
export let frameBuffer: WebGLFramebuffer = null;

/**
 * 应用程序类
 * 管理Cubism SDK。
 */
export class HxpAgent {
  /**
   * 返回类的实例(singleton)。
   * 如果没有生成实例，则在内部生成实例。
   *
   * @return 类的实例
   */
  public static getInstance(): HxpAgent {
    if (s_instance == null) {
      s_instance = new HxpAgent();
    }

    return s_instance;
  }

  /**
   * 释放类的实例(singleton)。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance.release();
    }

    s_instance = null;
  }

  /**
   * 初始化APP所需的物品。
   */
  public initialize(): boolean {
    // 画布的制作
    canvas = document.querySelector('.test');
    if (LAppDefine.CanvasSize === 'auto') {
      this._resizeCanvas();
    } else {
      canvas.width = LAppDefine.CanvasSize.width;
      canvas.height = LAppDefine.CanvasSize.height;
    }

    // gl上下文初始化
    // @ts-ignore
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      alert('Cannot initialize WebGL. This browser does not support.');
      gl = null;

      document.body.innerHTML =
        'This browser does not support the <code>&lt;canvas&gt;</code> element.';

      // gl初始化失败
      return false;
    }


    if (!frameBuffer) {
      frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    // 透明設定
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);




    // AppView的初始化
    this._view.initialize();

    // Cubism SDK的初始化
    this.initializeCubism();


    return true;
  }

  /**
   * 调整画布大小并重新初始化视图。
   */
  public onResize(): void {
    this._resizeCanvas();
    this._view.initialize();
    this._view.initializeSprite();
  }

  /**
   * 释放
   */
  public release(): void {
    this._textureManager.release();
    this._textureManager = null;

    this._view.release();
    this._view = null;

    // 解放资源
    HxpMManager.releaseInstance();

    // Cubism SDK 的释放
    CubismFramework.dispose();
  }

  /**
   * 执行处理
   */
  public run(): void {
    // 主循环
    const loop = (): void => {
      // 确认是否存在实例
      if (s_instance == null) {
        return;
      }

      // 更新时间
      HxpTimer.updateTime();

      // 画面初始化
      gl.clearColor(0, 0, 0, 0);

      // 深度测试有效化
      gl.enable(gl.DEPTH_TEST);

      // 近处的物体会掩盖远处的物体
      gl.depthFunc(gl.LEQUAL);

      // 清除颜色缓冲器和深度缓冲器
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.clearDepth(1.0);

      // 透過設定
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 描画更新
      this._view.render();

      // 递归调用循环
      requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * 注册着色器。
   */
  public createShader(): WebGLProgram {
    // vertex着色器的编译
    const vertexShaderId = gl.createShader(gl.VERTEX_SHADER);

    if (vertexShaderId == null) {
      HxpTimer.printMessage('failed to create vertexShader');
      return null;
    }

    const vertexShader: string =
      'precision mediump float;' +
      'attribute vec3 position;' +
      'attribute vec2 uv;' +
      'varying vec2 vuv;' +
      'void main(void)' +
      '{' +
      '   gl_Position = vec4(position, 1.0);' +
      '   vuv = uv;' +
      '}';

    gl.shaderSource(vertexShaderId, vertexShader);
    gl.compileShader(vertexShaderId);

    // 编译片段着色器
    const fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER);

    if (fragmentShaderId == null) {
      HxpTimer.printMessage('failed to create fragmentShader');
      return null;
    }

    const fragmentShader: string =
      'precision mediump float;' +
      'varying vec2 vuv;' +
      'uniform sampler2D texture;' +
      'void main(void)' +
      '{' +
      '   gl_FragColor = texture2D(texture, vuv);' +
      '}';

    gl.shaderSource(fragmentShaderId, fragmentShader);
    gl.compileShader(fragmentShaderId);

    // 程序对象的创建
    const programId = gl.createProgram();
    gl.attachShader(programId, vertexShaderId);
    gl.attachShader(programId, fragmentShaderId);

    gl.deleteShader(vertexShaderId);
    gl.deleteShader(fragmentShaderId);

    // 连接
    gl.linkProgram(programId);

    gl.useProgram(programId);

    return programId;
  }

  /**
   * 获取View信息。
   */
  public getView(): HxpView {
    return this._view;
  }

  public getTextureManager(): HxpTexture {
    return this._textureManager;
  }

  /**
   * 构造函数
   */
  constructor() {
    this._captured = false;
    this._mouseX = 0.0;
    this._mouseY = 0.0;
    this._isEnd = false;

    this._cubismOption = new Option();
    this._view = new HxpView();
    this._textureManager = new HxpTexture();
  }

  /**
   * Cubism SDK的初始化
   */
  public initializeCubism(): void {
    // setup cubism
    this._cubismOption.logFunction = HxpTimer.printMessage;
    this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel;
    CubismFramework.startUp(this._cubismOption);

    // initialize cubism
    CubismFramework.initialize();

    // load model
    HxpMManager.getInstance();

    HxpTimer.updateTime();

    this._view.initializeSprite();
  }

  /**
   * Resize the canvas to fill the screen.
   */
  private _resizeCanvas(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  _cubismOption: Option; // Cubism SDK Option
  _view: HxpView; // View信息
  _captured: boolean; // 是否在点击
  _mouseX: number; // 鼠标X坐标
  _mouseY: number; // 鼠标Y坐标
  _isEnd: boolean; // APP是否已关闭
  _textureManager: HxpTexture; // 纹理管理
}


