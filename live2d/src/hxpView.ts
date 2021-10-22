/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { CubismViewMatrix } from '@framework/math/cubismviewmatrix';

import * as LAppDefine from './lappdefine';
import { canvas, gl, HxpAgent } from './hxpAgent';
import { HxpMManager } from './hxpMManager';
import { HxpSprite } from './hxpSprite';
import { TextureInfo } from './hxpTexture';

/**
 * 绘图类
 */
export class HxpView {
  /**
   * 构造函数
   */
  constructor() {
    this._programId = null;
    this._back = null;


    // 将设备坐标转换为屏幕坐标
    this._deviceToScreen = new CubismMatrix44();

    // 进行画面显示的放大缩小和移动变换的矩阵
    this._viewMatrix = new CubismViewMatrix();
  }

  /**
   * 初始化
   */
  public initialize(): void {
    const { width, height } = canvas;

    const ratio: number = width / height;
    const left: number = -ratio;
    const right: number = ratio;
    const bottom: number = LAppDefine.ViewLogicalLeft;
    const top: number = LAppDefine.ViewLogicalRight;

    this._viewMatrix.setScreenRect(left, right, bottom, top); // 对应于设备的画面范围。X的左端、X的右端、Y的下端、Y的上端
    this._viewMatrix.scale(LAppDefine.ViewScale, LAppDefine.ViewScale);

    this._deviceToScreen.loadIdentity();
    if (width > height) {
      const screenW: number = Math.abs(right - left);
      this._deviceToScreen.scaleRelative(screenW / width, -screenW / width);
    } else {
      const screenH: number = Math.abs(top - bottom);
      this._deviceToScreen.scaleRelative(screenH / height, -screenH / height);
    }
    this._deviceToScreen.translateRelative(-width * 0.5, -height * 0.5);

    // 显示范围的设定
    this._viewMatrix.setMaxScale(LAppDefine.ViewMaxScale); // 极限扩展率
    this._viewMatrix.setMinScale(LAppDefine.ViewMinScale); // 极限缩小率

    // 能显示的最大范围
    this._viewMatrix.setMaxScreenRect(
      LAppDefine.ViewLogicalMaxLeft,
      LAppDefine.ViewLogicalMaxRight,
      LAppDefine.ViewLogicalMaxBottom,
      LAppDefine.ViewLogicalMaxTop
    );
  }

  /**
   * 解放
   */
  public release(): void {
    this._viewMatrix = null;
    this._deviceToScreen = null;

    this._back.release();
    this._back = null;

    gl.deleteProgram(this._programId);
    this._programId = null;
  }

  /**
   * 绘图
   */
  public render(): void {
    gl.useProgram(this._programId);

    gl.flush();

    const modelManager: HxpMManager = HxpMManager.getInstance();

    modelManager.setViewMatrix(this._viewMatrix);

    modelManager.onUpdate();
  }

  /**
   * 进行图像的初始化。
   */
  public initializeSprite(): void {
    const width: number = canvas.width;
    const height: number = canvas.height;

    const textureManager = HxpAgent.getInstance().getTextureManager();
    const resourcesPath = '../img/hi/';

    let imageName = '';

    // 背景图像初始化
    imageName = 'test-1.png';

    // 因为异步，所以我们创建了回调函数
    const initBackGroundTexture = (textureInfo: TextureInfo): void => {

      const x = 100;
      const y = 100;
      const fwidth = textureInfo.width;
      const fheight = textureInfo.height;


      this._back = new HxpSprite(x, y, fwidth, fheight, textureInfo.id);
    };

    textureManager.createTextureFromPngFile(
      resourcesPath + imageName,
      false,
      initBackGroundTexture
    );


    // 创建着色器
    if (this._programId == null) {
      this._programId = HxpAgent.getInstance().createShader();
    }
  }





  /**
   * 将X坐标转换为View坐标。
   *
   * @param deviceX 设备X坐标
   */
  public transformViewX(deviceX: number): number {
    const screenX: number = this._deviceToScreen.transformX(deviceX); // 逻辑坐标取得变换后的坐标。
    return this._viewMatrix.invertTransformX(screenX); // 扩大、缩小、移动后的值。
  }

  /**
   * 将Y坐标转换为View坐标。
   *
   * @param deviceY 设备Y坐标
   */
  public transformViewY(deviceY: number): number {
    const screenY: number = this._deviceToScreen.transformY(deviceY); // 逻辑坐标取得变换后的坐标。
    return this._viewMatrix.invertTransformY(screenY);
  }

  /**
   * 将X坐标转换为Screen坐标。
   * @param deviceX 设备X坐标
   */
  public transformScreenX(deviceX: number): number {
    return this._deviceToScreen.transformX(deviceX);
  }

  /**
   * 将Y坐标转换为Screen坐标。
   *
   * @param deviceY 设备Y坐标
   */
  public transformScreenY(deviceY: number): number {
    return this._deviceToScreen.transformY(deviceY);
  }

  _deviceToScreen: CubismMatrix44; // 从设备到屏幕的队列
  _viewMatrix: CubismViewMatrix; // viewMatrix
  _programId: WebGLProgram; // 着色器ID
  _back: HxpSprite; // 背景画像
  _changeModel: boolean; // 模型切换标记
  _isClick: boolean; // 点击中
}
