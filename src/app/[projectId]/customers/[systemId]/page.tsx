'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Customer } from "@/models/customer";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, BarChart2, Send, Activity } from "lucide-react";
import CustomerInformation from "./customer-information";

export default function CustomerDetailsPage() {
  const params = useParams();
  const { projectId, systemId } = params as { projectId: string; systemId: string };
  const [ customer, setCustomer ] = useState<Customer>();

  useEffect(() => {
    api.get(`/api/customers/${systemId}`, {
      headers: {
        "X-Project-ID": projectId,
      },
    }).then((response) => {
      setCustomer(response.data);
    }).catch((error) => {
      console.error(error);
    });
  }, [systemId]);

  return (
    <div>
      <div className="mb-6">
        <Link href={`.`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Customers
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {customer?.firstName} {customer?.lastName}
          </h3>
          <p className="leading-7">Customer ID: {customer?.customerId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`${systemId}/log-event`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus size={16} />
              Log Event
            </Button>
          </Link>
          <Link href={`${systemId}/edit`}>
            <Button className="bg-gradient-primary" variant="default">
              <Pencil size={16} />
              Edit customer
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-8">
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User size={16} /> Customer Information
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <CustomerInformation customer={customer} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}