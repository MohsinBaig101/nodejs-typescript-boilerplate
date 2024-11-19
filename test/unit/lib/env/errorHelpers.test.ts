import { getErrorMessage } from '../../../../src/lib/env/errorHelpers';

describe('getErrorMessage', () => {
    it('should replace [fieldName] with fieldName', () => {
        const fieldName = 'Email';
        const message = 'The field [fieldName] is required.';
        const expected = 'The field Email is required.';
        
        const result = getErrorMessage(fieldName, message);
        expect(result).toEqual(expected);
    });

    it('should replace all occurrences of [fieldName]', () => {
        const fieldName = 'Password';
        const message = 'Invalid [fieldName], please enter a valid [fieldName].';
        const expected = 'Invalid Password, please enter a valid Password.';
        
        const result = getErrorMessage(fieldName, message);
        expect(result).toEqual(expected);
    });

    it('should return the message unchanged if no [fieldName] found', () => {
        const fieldName = 'Username';
        const message = 'Please enter your [username].';
        
        const result = getErrorMessage(fieldName, message);
        expect(result).toEqual(message);
    });

    it('should handle empty fieldName gracefully', () => {
        const fieldName = '';
        const message = 'Field [fieldName] is required.';
        const expected = 'Field  is required.'; // Note: The space is intentional
        
        const result = getErrorMessage(fieldName, message);
        expect(result).toEqual(expected);
    });

    it('should return empty string if message is empty', () => {
        const fieldName = 'Name';
        const message = '';
        
        const result = getErrorMessage(fieldName, message);
        expect(result).toEqual('');
    });
});
