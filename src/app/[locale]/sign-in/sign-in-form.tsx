'use client';

import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be blank'),
    email: z.email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Password must match',
    path: ['passwordConfirm'],
  });

type FormData = z.infer<typeof formSchema>;

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });
  const onSubmit = (data: FormData) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label className="mb-2 cursor-pointer" htmlFor="sign-in-name">
        Name
      </Label>
      <Input id="sign-in-name" type="text" placeholder="John" {...register('name')} />
      <p>{errors.name?.message}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-in-email">
        Email
      </Label>
      <Input id="sign-in-email" type="email" placeholder="john@email.com" {...register('email')} />
      <p>{errors.email?.message}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-in-password">
        Password
      </Label>
      <Input id="sign-in-password" type="password" {...register('password')} />
      <p>{errors.password?.message}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-in-password-confirm">
        Password Confirm
      </Label>
      <Input id="sign-in-password-confirm" type="password" {...register('passwordConfirm')} />
      <p>{errors.passwordConfirm?.message}</p>

      <Button type="submit" className="mt-5">
        Отправить
      </Button>
    </form>
  );
}
