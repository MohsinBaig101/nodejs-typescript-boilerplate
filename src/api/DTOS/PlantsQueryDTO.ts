import {
    IsNotEmpty,
    ValidateIf,
    IsEnum
} from 'class-validator';
enum FilterBy {
    STATE = 'state',
    PLANTS = 'plants',
    STATETOTALS = 'stateTotals',
    PLANTPERCENTAGE = 'plantPercentage',
}
export class PlantsQuery {
    @IsEnum(FilterBy, { message: 'FilterBy must be one of the following values: state, plants, stateTotals, plantPercentage' })
    public filterBy: FilterBy;

    @ValidateIf(o => o?.filterBy === 'plants')
    @IsNotEmpty()
    public topPlants: number;

    @ValidateIf(o => o.filterBy === 'state')
    @IsNotEmpty()
    public state: string;

}
