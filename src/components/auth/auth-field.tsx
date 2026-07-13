import type { UseFormRegisterReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { FieldError } from './field-error';

type AuthFieldProps = Readonly<{
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegisterReturn;
}>;

export function AuthField({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  register,
}: AuthFieldProps) {
  return (
    <div>
      <Label className="mt-5 mb-2 cursor-pointer md:text-sm" htmlFor={id}>
        {label}
      </Label>
      <Input
        className="md:h-10 md:text-sm"
        id={id}
        placeholder={placeholder}
        type={type}
        {...register}
      />
      <FieldError message={error} />
    </div>
  );
}
