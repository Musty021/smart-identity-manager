import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Building2, FileText, Users } from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Organization {
  id: string;
  name: string;
  type: string;
  category: string;
  code: string;
}

interface DocumentType {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string;
}

const AddMember = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    other_names: '',
    document_number: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      fetchDocumentTypes(selectedOrganization);
    } else {
      setDocumentTypes([]);
      setSelectedDocumentType('');
    }
  }, [selectedOrganization]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    }
  };

  const fetchDocumentTypes = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('Error fetching document types:', error);
      toast.error('Failed to load document types');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrganization || !selectedDocumentType) {
      toast.error('Please select an organization and document type');
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.document_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('members')
        .insert({
          organization_id: selectedOrganization,
          document_type_id: selectedDocumentType,
          document_number: formData.document_number,
          first_name: formData.first_name,
          last_name: formData.last_name,
          other_names: formData.other_names || null,
          email: formData.email || null,
          phone: formData.phone || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          address: formData.address || null
        });

      if (error) throw error;

      toast.success('Member registered successfully');
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        other_names: '',
        document_number: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: ''
      });
      setSelectedOrganization('');
      setSelectedDocumentType('');

    } catch (error: any) {
      console.error('Error registering member:', error);
      if (error.code === '23505') {
        toast.error('This document number already exists for this organization');
      } else {
        toast.error('Failed to register member');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOrgData = organizations.find(org => org.id === selectedOrganization);
  const selectedDocTypeData = documentTypes.find(dt => dt.id === selectedDocumentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Header />
      
      <div className="container mx-auto px-6 py-32">
        <FadeIn>
          <div className="mb-8 text-center">
            <UserPlus className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Member</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Register a new member to your organization with biometric enrollment capability
            </p>
          </div>
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <FadeIn delay={100}>
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Organization Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="organization" className="text-sm font-medium text-gray-700">
                      Organization *
                    </Label>
                    <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span>{org.name} ({org.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedOrgData && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedOrgData.category} • {selectedOrgData.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="document_type" className="text-sm font-medium text-gray-700">
                      Document Type *
                    </Label>
                    <Select 
                      value={selectedDocumentType} 
                      onValueChange={setSelectedDocumentType}
                      disabled={!selectedOrganization}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((docType) => (
                          <SelectItem key={docType.id} value={docType.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{docType.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDocTypeData && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedDocTypeData.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Document Number */}
                <div>
                  <Label htmlFor="document_number" className="text-sm font-medium text-gray-700">
                    {selectedDocTypeData?.name || 'Document Number'} *
                  </Label>
                  <Input
                    id="document_number"
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => handleInputChange('document_number', e.target.value)}
                    placeholder={`Enter ${selectedDocTypeData?.name.toLowerCase() || 'document number'}`}
                    className="mt-1"
                    required
                  />
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                      First Name *
                    </Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter first name"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                      Last Name *
                    </Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Enter last name"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="other_names" className="text-sm font-medium text-gray-700">
                      Other Names
                    </Label>
                    <Input
                      id="other_names"
                      type="text"
                      value={formData.other_names}
                      onChange={(e) => handleInputChange('other_names', e.target.value)}
                      placeholder="Enter other names"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                      Gender
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Register Member
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </FadeIn>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddMember;