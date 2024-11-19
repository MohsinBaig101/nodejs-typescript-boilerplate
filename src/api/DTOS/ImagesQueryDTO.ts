import {
    IsNotEmpty
} from 'class-validator';
import { IsBiggerThan } from '../decorators/IsBigger';

export class ImageQuery {

    @IsNotEmpty()
    public depthMin: number;

    @IsBiggerThan('depthMin', {
        message: 'depthMax must be larger than depthMin',
    })
    @IsNotEmpty()
    public depthMax: number;

}
