import AdminContentBlock from '@/elements/AdminContentBlock';
import DiscountCodesTable from './DiscountCodesTable';
import DiscountCodeDialog from './DiscountCodeDialog';
import FlashMessageRender from '@/elements/FlashMessageRender';

export default () => (
    <AdminContentBlock title={'Billing Orders'}>
        <div className={'flex w-full flex-row items-center p-8'}>
            <div className={'flex flex-shrink flex-col'} style={{ minWidth: '0' }}>
                <h2 className={'font-header text-2xl font-medium text-neutral-50'}>Discount Codes</h2>
                <p
                    className={
                        'hidden overflow-hidden overflow-ellipsis whitespace-nowrap text-base text-neutral-400 lg:block'
                    }
                >
                    The available discount codes for clients to use on checkout.
                </p>
            </div>
            <div className={'ml-auto flex space-x-4 pl-4'}>
                <DiscountCodeDialog />
            </div>
        </div>
        <FlashMessageRender byKey={'admin:billing:discount-codes'} className={'mb-2'} />
        <DiscountCodesTable />
    </AdminContentBlock>
);
