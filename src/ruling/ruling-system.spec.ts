import {expect} from 'chai';
import {objectMatchesSelectionCriteria, ruleCriteriaIsValid, RuleCriteria} from './ruling-system';

describe('Transaction Filter Rule System', function () {
    it('does not get confused by 0', () => {
        const data = { value: 7n };
        const selectionCriteria: RuleCriteria = [ {$and: [{value: {$gt: 0n}}]} ];
        expect(objectMatchesSelectionCriteria(data, selectionCriteria, selectionCriteria[0])).to.equal(true);
    });

    it('can filter on greater-than', () => {
        const data = { value: 7n };
        const selectionCriteria: RuleCriteria = [ {$and: [{value: {$gt: 6n}}]} ];
        expect(objectMatchesSelectionCriteria(data, selectionCriteria, selectionCriteria[0])).to.equal(true);
    });

    it('can filter on less-than', () => {
        const data = { value: 7n };
        const selectionCriteria = [ {$and: [{value: {$lt: 8n}}]} ];
        expect(objectMatchesSelectionCriteria(data, selectionCriteria, selectionCriteria[0])).to.equal(true);
    });
});

describe('Selection Criteria Validation', function () {
    it('empty $or is valid', function () {
        const result = ruleCriteriaIsValid([
            { $or: [ ] }
        ])

        expect(result).to.equal(true);
    });

    it('empty $and is valid', function () {
        const result = ruleCriteriaIsValid([
            { $or: [ ] }
        ])

        expect(result).to.equal(true);
    });

    it('$and with all value comparisons is valid', function () {
        const result = ruleCriteriaIsValid([
            {
                $and: [
                    { value: { $gt: 3n } },
                    { value: { $lt: 5n } }
                ]
            }
        ]);

        expect(result).to.equal(true);
    });

    it('$or with all value comparisons is valid', function () {
        const result = ruleCriteriaIsValid([
            {
                $or: [
                    { value: { $gt: 3n } },
                    { value: { $lt: 5n } }
                ]
            }
        ]);

        expect(result).to.equal(true);
    });

    it('comparisons without a proper modifier are invalid', function () {
        const result = ruleCriteriaIsValid([
            {
                $or: [
                    { value: { somethingStrange: 3n } },
                    { value: { $lt: 5n } }
                ] as any[]
            }
        ]);

        expect(result).to.equal(false);
    });

    it('top-level comparisons are invalid, because they are ambiguous', function () {
        const result = ruleCriteriaIsValid([
            { value: { $gt: 3n } },
            { value: { $lt: 5n } }
        ]);

        expect(result).to.equal(false);
    });
});
