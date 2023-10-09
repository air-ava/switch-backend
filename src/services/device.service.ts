import DeviceRepo from '../database/repositories/device.repo';
import { sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import Utils from '../utils/utils';

const Service = {
  formatDeviceInfo(payload: any) {
    const types = [
      { condition: payload.isDesktop, type: 'Desktop' },
      { condition: payload.isMobile && payload.isiPhone, type: 'iPhone' },
      { condition: payload.isMobile && payload.isAndroid, type: 'Android Mobile' },
      { condition: payload.isMobile, type: 'Mobile' },
      { condition: payload.isTablet && payload.isiPad, type: 'iPad' },
      { condition: payload.isTablet && payload.isAndroidTablet, type: 'Android Tablet' },
      { condition: payload.isTablet, type: 'Tablet' },
      { condition: payload.isSmartTV, type: 'SmartTV' },
      { condition: payload.isBot, type: 'Bot' },
      { condition: payload.isCurl, type: 'CURL' },
      { condition: payload.isElectron, type: 'Electron App' },
      { condition: payload.isFacebook, type: 'Facebook App' },
      { condition: payload.isWechat, type: 'WeChat' },
      { condition: payload.isiPod, type: 'iPod' },
      { condition: payload.isAndroidNative || payload.isAndroid, type: 'Android Device' },
      { condition: payload.isBlackberry, type: 'Blackberry' },
      { condition: payload.isMac, type: 'Mac' },
      { condition: payload.isWindows, type: 'Windows' },
      { condition: payload.isLinux || payload.isLinux64, type: 'Linux' },
      { condition: payload.isChromeOS, type: 'Chrome OS' },
    ];

    const foundType = types.find((item) => item.condition);
    const { isMobile, os, browser, platform, source, version } = payload;
    return {
      deviceType: foundType ? foundType.type : 'unknown',
      isMobile,
      os,
      browser,
      platform,
      version,
      source,
    };
  },

  async findOrCreateDevice(data: any): Promise<theResponse> {
    const { loggedInUser, school, deviceType, isMobile, os, browser, platform, source, version } = data;
    const device = await DeviceRepo.findOrCreateDevice({
      deviceType,
      isMobile,
      os,
      name: Utils.isFalsyOrUnknown(platform) ? source || browser : platform,
      model: version,
      schoolId: school.id,
      ownerId: loggedInUser.id,
    });
    return sendObjectResponse('Device Created Successfully', device);
  },
};

export default Service;
