import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsBiggerThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBiggerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: number | string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = Number((args.object)[relatedPropertyName]);
          return typeof Number(value) === 'number' && typeof relatedValue === 'number' && Number(value) > relatedValue;
        },
      },
    });
  };
}