// src/database/repositories/Device.repo.ts

import { EntityRepository, QueryRunner, getRepository, UpdateResult, FindConditions } from 'typeorm';
import randomstring from 'randomstring';
import { Device } from '../models/device.model';
import { IDevice } from '../modelInterfaces';

type QueryParam = Partial<IDevice> | any;
type SelectOptions = Array<keyof IDevice>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

const DeviceRepository = {
  async getDevice(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<Device | undefined> {
    const repository = t ? t.manager.getRepository(Device) : getRepository(Device);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listDevices(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<Device[] | any[]> {
    const repository = t ? t.manager.getRepository(Device) : getRepository(Device);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async createDevice(queryParams: Partial<Device> | Partial<Device>[] | any, t?: Transaction): Promise<Device> {
    const repository = t ? t.manager.getRepository(Device) : getRepository(Device);
    const payload = {
      code: `dev_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  async findOrCreateDevice(queryParams: Partial<Device> | Partial<Device>[] | any, t?: Transaction): Promise<Device> {
    const repository = t ? t.manager.getRepository(Device) : getRepository(Device);

    const { deviceType, name, school, ownerId } = queryParams;

    const findConditions: FindConditions<IDevice> = { schoolId: school, ownerId };
    if (name) findConditions.name = name;
    if (deviceType) findConditions.deviceType = deviceType;

    const existingDevice = await repository.findOne({ where: findConditions });
    if (existingDevice) return existingDevice;

    const payload = {
      code: `dev_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  async updateDevice(queryParams: Partial<Device>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(Device) : getRepository(Device);
    return repository.update(queryParams, updateFields);
  },
};

export default DeviceRepository;
