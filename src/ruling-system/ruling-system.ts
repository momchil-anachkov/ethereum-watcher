import {REPOSITORY} from '../injection-tokens';
import {Repository} from '../database/repository';
import {EthereumTransaction, Rule} from '../models';

export class RulingSystem {
    private readonly repository: Repository;
    private activeRules?: Rule[];

    constructor(opts: any) {
        this.repository = opts[REPOSITORY];
    }

    async createRule(ruleToCreate: Rule) {
        const rule = await this.repository.saveRule(ruleToCreate);
        if (rule.active) {
            this.activeRules?.push(rule);
        }
    }

    async processTransactions(transactions: EthereumTransaction[]) {
        const activeRules = await this.getActiveRules();

        const transactionsToInsert: EthereumTransaction[] = [];
        for (const transactionData of transactions as EthereumTransaction[]) {
            for (const rule of activeRules) {
                if (matchesSelectionCriteria(transactionData as any, rule.criteria, rule.criteria[0] as JoinCriteria)) {
                    transactionsToInsert.push({...transactionData, RuleId: rule.id} as any);
                }
            }
        }

        const inserted = await this.repository.saveManyEthTransactions(transactionsToInsert);
        return inserted;
    }

    private async getActiveRules() {
        if (!this.activeRules) {
            this.activeRules = await this.repository.getActiveRules();
        }
        return this.activeRules;
    }
}

export function ruleCriteriaIsValid(criteriaList: RuleCriteria, treeLevel: number = 0): boolean {
    if (everyCriteriaIsValue(criteriaList) && treeLevel > 0) {
        return true;
    }

    for (const criteria of criteriaList) {
        if (criteriaIsOr(criteria)) {
            return ruleCriteriaIsValid(criteria.$or, treeLevel + 1);
        } else if (criteriaIsAnd(criteria)) {
            return ruleCriteriaIsValid(criteria.$and, treeLevel + 1);
        }
    }

    return false;
}

export function matchesSelectionCriteria(
    data: Record<string, string | bigint>,
    criteriaList: RuleCriteria,
    context: JoinCriteria,
): boolean {

    if (everyCriteriaIsValue(criteriaList)) {
        let everyValueCriteriaMatches = true;
        if (criteriaIsOr(context)) {
            for (const criteria of criteriaList) {
                everyValueCriteriaMatches = everyValueCriteriaMatches || comparisonsMatch(data, criteria);
            }
        } else {
            for (const criteria of criteriaList) {
                everyValueCriteriaMatches = everyValueCriteriaMatches && comparisonsMatch(data, criteria);
            }
        }
        return everyValueCriteriaMatches;
    } else {
        let everyJoinCriteriaMatches = true;
        for (const criteria of criteriaList) {
            if (criteriaIsOr(criteria)) {
                everyJoinCriteriaMatches = everyJoinCriteriaMatches || matchesSelectionCriteria(data, criteria.$or, criteria);
            } else {
                everyJoinCriteriaMatches = everyJoinCriteriaMatches && matchesSelectionCriteria(data, criteria.$and, criteria);
            }
        }
        return everyJoinCriteriaMatches
    }
}

function everyCriteriaIsValue(criteriaList: RuleCriteria): criteriaList is ValueCriteria[] {
    let everyCriteriaIsValue = true;
    for (const criteria of criteriaList) {
        everyCriteriaIsValue = everyCriteriaIsValue && criteriaIsValue(criteria);
    }
    return everyCriteriaIsValue;
}

function criteriaIsValue(criteria: JoinCriteria | ValueCriteria): criteria is ValueCriteria {
    if ((criteria as AndCriteria).$and || (criteria as OrCriteria).$or) {
        return false;
    }

    // There's probably a better way to do this
    let allPropertiesHaveValidComparisons = true;
    for (const propertyName of Object.keys(criteria as ValueCriteria)) {
        allPropertiesHaveValidComparisons = allPropertiesHaveValidComparisons && (
            // FIXME: Ordering here is first come first serve if you happen to specify multiple comparisons
            //  there is no check for duplicate comparisons
            ((criteria as ValueCriteria)[propertyName] as GreaterThan).$gt != null ||
            ((criteria as ValueCriteria)[propertyName] as LessThan).$lt != null ||
            ((criteria as ValueCriteria)[propertyName] as Equals).$eq != null
        );
    }

    return allPropertiesHaveValidComparisons;
}

function criteriaIsAnd(criteria: JoinCriteria | ValueCriteria): criteria is AndCriteria {
    return (criteria as AndCriteria).$and != null;
}

function criteriaIsOr(criteria: JoinCriteria | ValueCriteria): criteria is OrCriteria {
    return (criteria as OrCriteria).$or != null;
}

function comparisonIsLt(comparison: Comparison): comparison is LessThan {
    return (comparison as LessThan).$lt != null;
}

function comparisonIsGt(comparison: Comparison): comparison is GreaterThan {
    return (comparison as GreaterThan).$gt != null;
}

function comparisonIsEq(comparison: Comparison): comparison is GreaterThan {
    return (comparison as Equals).$eq != null;
}

function comparisonsMatch(row: Record<string, bigint | string>, criteria: ValueCriteria) {
    let allComparisonsMatch = true;

    const properties = Object.keys(criteria);
    for (const property of properties) {
        const comparison = criteria[property];

        if (comparisonIsLt(comparison)) {
            allComparisonsMatch = allComparisonsMatch && row[property] < comparison.$lt;
        } else if (comparisonIsGt(comparison)) {
            allComparisonsMatch = allComparisonsMatch && row[property] > comparison.$gt;
        } else if (comparisonIsEq(comparison)) {
            allComparisonsMatch = allComparisonsMatch && row[property] == comparison.$eq;
        } else {
            allComparisonsMatch = false;
        }
    }

    return allComparisonsMatch;
}

export type RuleCriteria = JoinCriteria[] | ValueCriteria[];
export type JoinCriteria = AndCriteria | OrCriteria;

export type AndCriteria = {
    $and: JoinCriteria[] | ValueCriteria[];
}

export type OrCriteria = {
    $or: JoinCriteria[] | ValueCriteria[];
}

export type ValueCriteria = {
    [key: string]: Comparison;
}

export type LessThan = { $lt: bigint };
export type GreaterThan = { $gt: bigint };
export type Equals = { $eq: bigint };
export type Comparison = LessThan | GreaterThan | Equals;
