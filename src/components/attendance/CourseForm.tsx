
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import FadeIn from '@/components/animations/FadeIn';

export type CourseFormValues = {
  courseName: string;
  courseCode: string;
};

interface CourseFormProps {
  onSubmit: (data: CourseFormValues) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSubmit }) => {
  const form = useForm<CourseFormValues>({
    defaultValues: {
      courseName: '',
      courseCode: '',
    },
  });

  return (
    <FadeIn>
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-center">Start New Attendance Session</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="courseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Introduction to Programming" required {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CIT 101" required {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-fud-green hover:bg-fud-green-dark">
                <Calendar className="mr-2 h-4 w-4" />
                Start Attendance Session
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </FadeIn>
  );
};

export default CourseForm;
