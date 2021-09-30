/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { ACubismMotion } from '@framework/motion/acubismmotion';
import { canvas } from './hxpAgent';
import { HxpModel } from './hxpModel';
import { HxpTimer } from './hxpTimer';

export let s_instance: HxpMManager = null;

/**
 * 在样本应用中管理CubismModel的类
 * 进行模型生成和丢弃、轻敲事件的处理、模型切换。
 */
export class HxpMManager {

	_viewMatrix: CubismMatrix44; // 用于模型绘制的view矩阵
	_model: HxpModel; // 模型实例的容器

	/**
	 * 构造函数
	 */
	constructor() {
		this._viewMatrix = new CubismMatrix44();
		this._model = new HxpModel();
	}


	/**
	 * 返回类的实例(singleton)。
	 * 如果没有生成实例，则在内部生成实例。
	 *
	 * @return 类的实例
	 */
	public static getInstance(): HxpMManager {
		if (s_instance == null) {
			s_instance = new HxpMManager();
		}

		return s_instance;
	}

	/**
	 * 释放类的实例(singleton)。
	 */
	public static releaseInstance(): void {
		if (s_instance != null) {
			s_instance = void 0;
		}

		s_instance = null;
	}

	/**
	 * 返回保持在当前场景中的模型。
	 *
	 * @param no 模型列表的索引值
	 * @return 返回模型的实例。如果索引值不在范围内，则返回空。
	 */
	public getModel(): HxpModel {
		return this._model;
	}


	/**
	 * 更新画面时的处理
	 * 进行模型的更新处理和绘制处理
	 */
	public onUpdate(): void {
		const { width, height } = canvas;

		const projection: CubismMatrix44 = new CubismMatrix44();


		const model: HxpModel = this.getModel();

		if (model.getModel()) {
			if (model.getModel().getCanvasWidth() > 1.0 && width < height) {
				// 在纵向窗口中显示横向较长的模型时，用模型的横向大小计算scale
				model.getModelMatrix().setWidth(2.0);
				projection.scale(1.0, width / height);
			} else {
				projection.scale(height / width, 1.0);
			}

			// 如果有需要，在这里相乘
			if (this._viewMatrix != null) {
				projection.multiplyByMatrix(this._viewMatrix);
			}
		}

		model.update();
		model.draw(projection); // 因为是参照交付，所以projection会变质。
	}

	public setViewMatrix(m: CubismMatrix44) {
		for (let i = 0; i < 16; i++) {
			this._viewMatrix.getArray()[i] = m.getArray()[i];
		}
	}

}
