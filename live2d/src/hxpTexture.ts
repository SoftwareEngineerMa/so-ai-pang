/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { csmVector, iterator } from '@framework/type/csmvector';

import { gl } from './hxpAgent';

/**
 * 纹理管理类
 * 进行图像读取和管理的类。
 */
export class HxpTexture {
  /**
   * 构造函数
   */
  constructor() {
    this._textures = new csmVector<TextureInfo>();
  }

  /**
   * 解放
   */
  public release(): void {
    for (
      let ite: iterator<TextureInfo> = this._textures.begin();
      ite.notEqual(this._textures.end());
      ite.preIncrement()
    ) {
      gl.deleteTexture(ite.ptr().id);
    }
    this._textures = null;
  }

  /**
   * 图像读取
   *
   * @param fileName 读取的图像文件路径名
   * @param usePremultiply 启用Premult处理
   * @return 图像信息读入失败时返回null
   */
  public createTextureFromPngFile(
    fileName: string,
    usePremultiply: boolean,
    callback: (textureInfo: TextureInfo) => void
  ): void {
    // search loaded texture already
    for (
      let ite: iterator<TextureInfo> = this._textures.begin();
      ite.notEqual(this._textures.end());
      ite.preIncrement()
    ) {
      if (
        ite.ptr().fileName == fileName &&
        ite.ptr().usePremultply == usePremultiply
      ) {
        // 第二次以后使用缓存(无等待时间)
        // WebKit需要重新实例才能再次调用同一Image的onload
        // 詳細：https://stackoverflow.com/a/5024181
        ite.ptr().img = new Image();
        ite.ptr().img.onload = (): void => callback(ite.ptr());
        ite.ptr().img.src = fileName;
        return;
      }
    }

    // 以加载数据为触发要素
    const img = new Image();
    img.onload = (): void => {
      // 创建纹理对象
      const tex: WebGLTexture = gl.createTexture();

      // 选择纹理
      gl.bindTexture(gl.TEXTURE_2D, tex);

      // 在纹理上写入像素
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // 进行Premult处理
      if (usePremultiply) {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      }

      // 在纹理上写入像素
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      // 生成地图
      gl.generateMipmap(gl.TEXTURE_2D);

      // 粘合纹理
      gl.bindTexture(gl.TEXTURE_2D, null);

      const textureInfo: TextureInfo = new TextureInfo();
      if (textureInfo != null) {
        textureInfo.fileName = fileName;
        textureInfo.width = img.width;
        textureInfo.height = img.height;
        textureInfo.id = tex;
        textureInfo.img = img;
        textureInfo.usePremultply = usePremultiply;
        this._textures.pushBack(textureInfo);
      }

      callback(textureInfo);
    };
    img.src = fileName;
  }

  /**
   * 图像的释放
   *
   * 释放阵列中存在的所有图像。
   */
  public releaseTextures(): void {
    for (let i = 0; i < this._textures.getSize(); i++) {
      this._textures.set(i, null);
    }

    this._textures.clear();
  }

  /**
   * 画像的释放
   *
   * 释放指定纹理的图像。
   * @param texture 释放的纹理
   */
  public releaseTextureByTexture(texture: WebGLTexture): void {
    for (let i = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).id != texture) {
        continue;
      }

      this._textures.set(i, null);
      this._textures.remove(i);
      break;
    }
  }

  /**
   * 画像的解放
   *
   * 释放指定名称的图像
   * @param fileName 释放的图像文件路径名称
   */
  public releaseTextureByFilePath(fileName: string): void {
    for (let i = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).fileName == fileName) {
        this._textures.set(i, null);
        this._textures.remove(i);
        break;
      }
    }
  }

  _textures: csmVector<TextureInfo>;
}

/**
 * 草图信息结构
 */
export class TextureInfo {
  img: HTMLImageElement; // 画像
  id: WebGLTexture = null; // 纹理
  width = 0; // 宽度
  height = 0; // 高度
  usePremultply: boolean; // 启用Premult处理
  fileName: string; // 文件名
}
