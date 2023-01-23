import { ApiBody } from '@nestjs/swagger';

export const CheckInGejalaBody =
  (): MethodDecorator =>
  (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        required: ['gejala_id', 'check_in_id'],
        properties: {
          gejala_id: {
            type: 'string',
          },
          check_in_id: {
            type: 'string',
          }
        },
      },
    })(target, propertyKey, descriptor);
  };
