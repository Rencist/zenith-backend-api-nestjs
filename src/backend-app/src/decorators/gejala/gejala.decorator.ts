import { ApiBody } from '@nestjs/swagger';

export const GejalaBody =
  (): MethodDecorator =>
  (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
          }
        },
      },
    })(target, propertyKey, descriptor);
  };
