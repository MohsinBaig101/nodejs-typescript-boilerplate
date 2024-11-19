import _ from 'lodash';
import { getPlantsMapper } from '../../../../src/lib/dataMapper/internal/PlantsMapper';

describe('getPlantsMapper', () => {
    it('should map plant properties correctly', () => {
        const plants = [
            {
                plantName: 'Plant A',
                state: 'State A',
                annualNetGeneration: '1000',
                latitude: '40.7128',
                longitude: '-74.0060'
            },
            {
                plantName: 'Plant B',
                state: 'State B',
                annualNetGeneration: '2000',
                latitude: '34.0522',
                longitude: '-118.2437'
            }
        ];

        const result = getPlantsMapper(plants);
        expect(result).toEqual(plants);
    });

    it('should handle missing plant properties by returning empty strings', () => {
        const plants = [
            {
                plantName: 'Plant C'
                // Missing other properties
            }
        ];

        const expectedOutput = [
            {
                plantName: 'Plant C',
                state: '',
                annualNetGeneration: '',
                latitude: '',
                longitude: ''
            }
        ];

        const result = getPlantsMapper(plants);
        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty array when input is null or undefined', () => {
        expect(getPlantsMapper(null)).toEqual([]);
        expect(getPlantsMapper(undefined)).toEqual([]);
    });

    it('should return an empty array when input is an empty array', () => {
        expect(getPlantsMapper([])).toEqual([]);
    });
});
