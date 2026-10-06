import classNames from 'classnames';
import Spinner from '@/elements/Spinner';
import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import ContentBox from '@/elements/ContentBox';
import { useEffect, useState } from 'react';
import PageContentBlock from '@/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArchive,
    faDatabase,
    faEthernet,
    faExclamationTriangle,
    faHdd,
    faMemory,
    faMicrochip,
    faShoppingBag,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Alert } from '@/elements/alert';
import { getProducts } from '@/api/routes/account/billing/products';
import { getCategories } from '@/api/routes/account/billing/categories';
import { Category, Product } from '@definitions/account/billing';
import LimitBox from '@/elements/billing/LimitBox';
import Money from '@/elements/billing/Money';
import { hexToRgba } from '@/lib/helpers';

export default () => {
    const [category, setCategory] = useState<number>();
    const [products, setProducts] = useState<Product[] | undefined>();
    const [categories, setCategories] = useState<Category[] | undefined>();

    const settings = useStoreState(s => s.everest.data!.billing);
    const { colors } = useStoreState(state => state.theme.data!);

    useEffect(() => {
        (async function () {
            await getCategories().then(data => {
                setCategories(data);
                setCategory(Number(data[0]!.id));
            });
        })();
    }, []);

    useEffect(() => {
        if (products || !category) return;

        getProducts(category).then(data => {
            setProducts(data);
        });
    }, [category]);

    if (!settings.keys.secret) {
        return (
            <Alert type={'danger'}>
                Due to a configuration error, the store is currently unavailable. Please try again later, or refresh the
                page.
            </Alert>
        );
    }

    return (
        <PageContentBlock title={'Available Products'}>
            <div className={'mt-8 mb-12 text-3xl font-bold lg:text-5xl'}>
                Order a Product
                <p className={'mt-1 text-sm font-normal text-gray-400'}>
                    Choose and configure any of the products below to your liking.
                </p>
            </div>
            <div className={'grid gap-4 lg:grid-cols-4 lg:gap-12'}>
                <div>
                    <p className={'mb-6 mt-4 text-2xl font-bold text-gray-300'}>Categories</p>
                    {(!categories || categories.length < 1) && (
                        <div className={'my-4 font-semibold text-gray-400'}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className={'mr-2 h-5 w-5 text-yellow-400'} />
                            No categories found.
                        </div>
                    )}
                    <div className={'flex flex-col gap-1'}>
                        {categories?.map(cat => {
                            const active = Number(cat.id) === category;

                            return (
                                <button
                                    className={classNames(
                                        'flex w-full cursor-pointer items-center rounded-lg border-l-4 py-3 px-4 text-left font-semibold duration-200 line-clamp-1',
                                        active
                                            ? 'text-neutral-100'
                                            : 'border-transparent text-gray-400 hover:text-gray-200',
                                    )}
                                    style={
                                        active
                                            ? {
                                                  borderColor: colors.primary,
                                                  backgroundColor: hexToRgba(colors.primary, 0.08),
                                              }
                                            : undefined
                                    }
                                    disabled={active}
                                    onClick={() => {
                                        setCategory(Number(cat.id));
                                        setProducts(undefined);
                                    }}
                                    key={cat.id}
                                >
                                    {cat.icon && (
                                        <img src={cat.icon} className={'mr-3 inline-flex h-6 w-6 rounded-full'} />
                                    )}
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className={'lg:col-span-3'}>
                    {!products ? (
                        <Spinner centered />
                    ) : (
                        <>
                            {products?.length < 1 && (
                                <div className={'my-4 font-semibold text-gray-400'}>
                                    <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className={'mr-2 h-5 w-5 text-yellow-400'}
                                    />
                                    No products could be found in this category.
                                </div>
                            )}
                            <div className={'grid grid-cols-1 gap-4 xl:grid-cols-3'}>
                                {products?.map(product => (
                                    <ContentBox
                                        key={product.id}
                                        className={
                                            'flex flex-col transition duration-200 hover:-translate-y-0.5 hover:shadow-xl'
                                        }
                                    >
                                        <div className={'flex flex-1 flex-col p-3 lg:p-6'}>
                                            <div className={'flex justify-center'}>
                                                <div
                                                    className={
                                                        'flex h-16 w-16 items-center justify-center rounded-full'
                                                    }
                                                    style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
                                                >
                                                    {product.icon ? (
                                                        <img src={product.icon} className={'h-9 w-9'} />
                                                    ) : (
                                                        <FontAwesomeIcon
                                                            icon={faShoppingBag}
                                                            className={'h-7 w-7'}
                                                            style={{ color: colors.primary }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <p className={'mt-4 text-center font-header text-2xl font-bold'}>
                                                {product.name}
                                            </p>
                                            <p className={'mt-1 mb-6 text-center'}>
                                                <Money
                                                    value={product.price}
                                                    suffix={' / mo'}
                                                    accent
                                                    className={'text-2xl font-bold'}
                                                />
                                            </p>
                                            <div className={'grid grid-cols-2 gap-x-4 gap-y-1'}>
                                                <LimitBox icon={faMicrochip} limit={<>{product.limits.cpu}% CPU</>} />
                                                <LimitBox
                                                    icon={faMemory}
                                                    limit={<>{product.limits.memory / 1024} GiB RAM</>}
                                                />
                                                <LimitBox
                                                    icon={faHdd}
                                                    limit={<>{product.limits.disk / 1024} GiB Disk</>}
                                                />
                                                <LimitBox
                                                    icon={faEthernet}
                                                    limit={
                                                        <>
                                                            {product.limits.allocation} port
                                                            {product.limits.allocation > 1 && 's'}
                                                        </>
                                                    }
                                                />
                                                {!!product.limits.backup && (
                                                    <LimitBox
                                                        icon={faArchive}
                                                        limit={<>{product.limits.backup} backups</>}
                                                    />
                                                )}
                                                {!!product.limits.database && (
                                                    <LimitBox
                                                        icon={faDatabase}
                                                        limit={<>{product.limits.database} databases</>}
                                                    />
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    'mt-auto border-t border-dashed border-gray-700 pt-4 text-center'
                                                }
                                            >
                                                <Link to={`/account/billing/order/${product.id}`}>
                                                    <Button size={Button.Sizes.Large} className={'w-full'}>
                                                        Configure
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </ContentBox>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageContentBlock>
    );
};
