import { Environments } from '@repo/common';

export interface IApiResponse<T> {
  payload?: T;
  meta: IApiResponseMeta;
}
export interface IApiResponseMeta {
  githubRunNumber: number;
  environment: Environments;
  gitRef: string;
  gitCommit: string;
  release: string;
}
