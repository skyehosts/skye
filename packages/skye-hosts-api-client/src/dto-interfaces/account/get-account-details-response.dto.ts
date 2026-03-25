export interface IGetAccountDetailsResponseDto {
  email: string | null;
  name: string;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  searchEngineIndexingEnabled: boolean;
}
