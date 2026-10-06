import AdminContentBlock from '@/elements/AdminContentBlock';
import InvoicesTable from './InvoicesTable';

export default () => (
    <AdminContentBlock title={'Billing Invoices'}>
        <div className={'flex w-full flex-row items-center p-8'}>
            <div className={'flex flex-shrink flex-col'} style={{ minWidth: '0' }}>
                <h2 className={'font-header text-2xl font-medium text-neutral-50'}>Invoices</h2>
                <p
                    className={
                        'hidden overflow-hidden overflow-ellipsis whitespace-nowrap text-base text-neutral-400 lg:block'
                    }
                >
                    Generated PDF invoices for orders placed on this Panel.
                </p>
            </div>
        </div>
        <InvoicesTable />
    </AdminContentBlock>
);
