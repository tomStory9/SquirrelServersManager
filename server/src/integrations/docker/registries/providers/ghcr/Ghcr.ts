import { SSMServicesTypes } from '../../../../../types/SSMServicesTypes';
import Registry from '../../Registry';

/**
 * Github Container Registry integration.
 */
export default class Ghcr extends Registry {
  getConnectedConfigurationSchema() {
    return [
      {
        name: 'token',
        type: 'string',
      },
    ];
  }

  // @ts-expect-error alternatives type
  getConfigurationSchema() {
    return this.joi.alternatives([
      this.joi.object().allow({}),
      this.joi.object().keys({
        token: this.joi.string().allow('').required(),
      }),
    ]);
  }

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      username: this.configuration.username,
      token: Ghcr.mask(this.configuration.token),
    };
  }

  /**
   * Return true if image has not registry url.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return /^.*\.?ghcr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to Github Container Registry characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    this.childLogger.info('[GHCR] - normalizeImage');
    const imageNormalized = image;
    imageNormalized.registry.name = 'ghcr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ) {
    const requestOptionsWithAuth = requestOptions;
    const bearer = Buffer.from(
      this.configuration.token ? this.configuration.token : ':',
      'utf-8',
    ).toString('base64');
    if (requestOptionsWithAuth.headers) {
      requestOptionsWithAuth.headers.Authorization = `Bearer ${bearer}`;
    }
    return requestOptionsWithAuth;
  }

  getAuthPull() {
    if (this.configuration.username && this.configuration.token) {
      return {
        username: this.configuration.username,
        password: this.configuration.token,
      };
    }
    return undefined;
  }
}
