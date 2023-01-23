import { ApiBody } from '@nestjs/swagger';

export const GejalaBody =
  (): MethodDecorator =>
  (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        required: ['penyakit', 'pasien_id'],
        properties: {
          penyakit: {
            type: 'string',
          },
          pasien_id: {
            type: 'string',
          }
        },
      },
    })(target, propertyKey, descriptor);
  };
