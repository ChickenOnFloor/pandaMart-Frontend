'use client';

import { useParams } from 'next/navigation';
import { useGetProductsBySellerQuery } from '@/lib/api/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ProductCardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function SellerProductsPage() {
  const params = useParams();
  const sellerId = params.sellerId as string;

  const { data: products, isLoading, error } = useGetProductsBySellerQuery(sellerId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Error loading products</h2>
          <p className="text-muted-foreground mt-2">
            {'Failed to load seller products'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Products from this Seller</h1>
      
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Card key={product.id}>
              <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <h3 className="font-semibold truncate">{product.name}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">${product.price}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {product.category}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/products/${product.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">No products found</h2>
          <p className="text-muted-foreground mt-2">
            This seller doesn't have any products yet.
          </p>
        </div>
      )}
    </div>
  );
}