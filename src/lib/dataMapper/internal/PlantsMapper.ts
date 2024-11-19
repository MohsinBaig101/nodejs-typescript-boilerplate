import _ from 'lodash';

export const getPlantsMapper = (plants) => {
    return (plants || []).map(plant => {
        return {
            plantName: _.get(plant, 'plantName', ''),
            state: _.get(plant, 'state', ''),
            annualNetGeneration: _.get(plant, 'annualNetGeneration', ''),
            latitude: _.get(plant, 'latitude', ''),
            longitude: _.get(plant, 'longitude', ''),
        };
    });
};
