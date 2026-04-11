'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchoolSettingsForm } from '@/components/features/school-settings/school-settings-form';
import { SessionsTermsManager } from '@/components/features/school-settings/sessions-terms-manager';
import { LevelsManager } from '@/components/features/school-settings/levels-manager';
import { ClassesManager } from '@/components/features/school-settings/classes-manager';
import { SubjectsManager } from '@/components/features/school-settings/subjects-manager';
import { GradingSystemsManager } from '@/components/features/school-settings/grading-systems-manager';

export default function SchoolSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="School Settings"
        description="Manage your school configuration, academic sessions, classes, subjects, and grading systems."
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sessions">Sessions & Terms</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SchoolSettingsForm />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionsTermsManager />
        </TabsContent>

        <TabsContent value="levels">
          <LevelsManager />
        </TabsContent>

        <TabsContent value="classes">
          <ClassesManager />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectsManager />
        </TabsContent>

        <TabsContent value="grading">
          <GradingSystemsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
