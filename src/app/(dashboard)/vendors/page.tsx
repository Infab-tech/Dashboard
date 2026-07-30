import { getVendors } from "@/lib/actions/vendors";
import { VendorTable } from "@/components/vendors/VendorTable";
import { VendorHeader } from "@/components/vendors/VendorHeader";

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <VendorHeader />
      <VendorTable vendors={vendors} />
    </div>
  );
}
