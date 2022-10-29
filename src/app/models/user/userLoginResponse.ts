export interface UserLoginResponse{
    Status?:boolean, //zbog ovog statusa on baguje u auth.service
    accessToken:string,
    tipKorisnika:string
}