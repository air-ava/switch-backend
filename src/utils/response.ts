/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Response } from 'express';

interface Payload {
  message: string;
  status: boolean;
  error: boolean;
  data?: any;
  meta?: any;
}

interface Config {
  message: string;
  status?: boolean;
  statusCode?: number;
  code?: number;
  data?: any;
}

export = {
  success(res: Response, message: string, data: any = null, meta: any = null) {
    const payload: any = {
      message,
      status: true,
      error: false,
    };
    if (data) payload.data = data;
    if (meta) payload.meta = meta;
    res.status(200).json(payload);
  },

  successTwo(res: Response, message: string, data: any = null, meta: any = null) {
    const payload: any = {
      message,
      success: true,
      error: false,
    };
    if (data) payload.data = data;
    if (meta) payload.meta = meta;
    res.status(200).json(payload);
  },

  failure(res: Response, message: string) {
    const payload: any = {
      message,
      status: false,
      error: true,
    };
    res.status(400).json(payload);
  },

  notFound(res: Response, message: string) {
    const payload: any = {
      message,
      status: false,
      error: true,
    };
    res.status(404).json(payload);
  },

  error(res: Response, message: string) {
    const payload: any = {
      message,
      status: false,
      error: true,
    };
    res.status(500).json(payload);
  },

  json(res: Response, config: Config) {
    const payload: any = {
      message: config.message,
      status: config.status ?? true,
    };
    if (config.data) payload.data = config.data;
    res.status(config.statusCode ?? config.code ?? 200).json(payload);
  },

  wemaInvalid(res: Response, status = '07', message = 'Invalid authorization') {
    res.status(400).json({
      status,
      status_desc: message,
    });
  },

  wemaSuccess(res: Response, status = '00', message = 'Successful', data: any = null) {
    const payload: any = {
      status,
      status_desc: message,
      ...data,
    };
    res.status(200).json(payload);
  },
};
