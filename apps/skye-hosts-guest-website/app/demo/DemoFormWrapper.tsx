'use client';

import {
  DemoForm,
  DemoFormResult,
  DemoFormValues,
} from '@repo/web-components/demo/demo-form';
import {
  IDemoFormRequestDto,
  IDemoFormResponseDto,
  fetchApi,
} from '../../../../packages/skye-hosts-api-client/src';

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
