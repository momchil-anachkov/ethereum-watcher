import {DataRepository} from '../database/data-repository';
import {REPOSITORY} from '../injection-tokens';
import {EthereumTransaction, EthereumTransactionLookupFields} from '../models';

export class TransactionsService {
    private readonly repository: DataRepository;

    constructor(opts: any) {
        this.repository = opts[REPOSITORY];
    }

    async getTransactions(lookupFields: EthereumTransactionLookupFields): Promise<EthereumTransaction[]> {
        return await this.repository.getTransactions(lookupFields);
    }
}