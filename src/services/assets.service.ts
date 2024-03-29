import cloudinary from '../config/cloudinary';
import { saveAssetsREPO } from '../database/repositories/assets.repo';
import { sendObjectResponse } from '../utils/errors';

export const createAsset = async (data: {
  imagePath: string;
  organisation?: number;
  user?: string;
  entity_id?: string;
  entity?: string;
  name?: string;
  reference?: string;
  trigger?: string;
  video?: boolean;
  customName?: string;
}): Promise<any> => {
  const { organisation, user, entity, entity_id, video, name: assetName, reference, trigger, customName } = data;
  const response = await cloudinary.uploader.upload(data.imagePath, {
    use_filename: false,
    unique_filename: true,
    overwrite: true,
    folder: 'joinSteward',
    ...(video && { resource_type: 'video' }),
    ...(customName && { public_id: customName }),
  });
  const { public_id: name, original_filename: file_name, resource_type: file_type, format: file_format, bytes, secure_url: url } = response;
  const createAssets = await saveAssetsREPO({
    name,
    file_name: (assetName && assetName) || file_name,
    ...(organisation && { organisation }),
    ...(user && { user }),
    ...(reference && { reference }),
    ...(trigger && { trigger }),
    ...(entity_id && { entity_id }),
    ...(entity && { entity }),
    file_type,
    file_format,
    bytes,
    url,
  });
  return sendObjectResponse('Asset created successfully', {
    id: createAssets.id,
    url,
    file_name,
  });
};
