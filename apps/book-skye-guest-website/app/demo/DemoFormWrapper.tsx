'use client';

import {
  IDemoFormRequestDto,
  IDemoFormResponseDto,
  fetchApi,
} from '@repo/book-skye-api-client';
import {
  DemoForm,
  DemoFormResult,
  DemoFormValues,
} from '@repo/web-components/demo/demo-form';

export function DemoFormWrapper() {
  const handleSubmit = (data: DemoFormValues): Promise<DemoFormResult> => {
    return fetchApi<IDemoFormResponseDto, IDemoFormRequestDto>('/demo/form', {
      ...data,
      age: Number(data.age),
      website: data.website || undefined,
    });
  };

  return <DemoForm onSubmit={handleSubmit} />;
}
