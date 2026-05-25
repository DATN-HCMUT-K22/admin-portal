import { Button, Card, Space, Input } from 'antd'

export default function TestIntegrationPage() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tailwind + Ant Design Integration Test</h1>
        <p className="text-gray-600">Testing both libraries working together</p>
      </div>

      {/* Layout Tests */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Layout Utilities (Tailwind)</h2>

        <div className="flex gap-4 items-center">
          <div className="bg-blue-500 text-white p-4 rounded">Flex Item 1</div>
          <div className="bg-green-500 text-white p-4 rounded">Flex Item 2</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-500 text-white p-4 rounded">Grid 1</div>
          <div className="bg-purple-500 text-white p-4 rounded">Grid 2</div>
          <div className="bg-purple-500 text-white p-4 rounded">Grid 3</div>
        </div>
      </section>

      {/* Ant Design Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ant Design Components</h2>

        <Card className="shadow-lg">
          <Space orientation="vertical" className="w-full" size="large">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Card with Mixed Styling</h3>
              <Button type="primary">Primary Button</Button>
            </div>

            <Input placeholder="Ant Design Input" />

            <div className="flex gap-2">
              <Button>Cancel</Button>
              <Button type="primary">Submit</Button>
              <Button danger>Delete</Button>
            </div>
          </Space>
        </Card>
      </section>

      {/* Color Tests */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Custom Ant Colors (Tailwind)</h2>

        <div className="flex gap-4 flex-wrap">
          <div className="bg-ant-primary text-white p-4 rounded">
            Ant Primary
          </div>
          <div className="bg-ant-success text-white p-4 rounded">
            Ant Success
          </div>
          <div className="bg-ant-error text-white p-4 rounded">
            Ant Error
          </div>
          <div className="bg-ant-warning text-white p-4 rounded">
            Ant Warning
          </div>
        </div>
      </section>

      {/* Responsive Tests */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Responsive Grid (Tailwind)</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-bold">1</p>
            <p className="text-sm text-gray-500">Responsive</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-gray-500">Responsive</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-gray-500">Responsive</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold">4</p>
            <p className="text-sm text-gray-500">Responsive</p>
          </Card>
        </div>
      </section>

      {/* Success Message */}
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ✓ Integration Working
        </h3>
        <p className="text-green-700">
          If you can see Tailwind utilities (spacing, colors, grid) and Ant Design components (buttons, cards, inputs) working together, the integration is successful!
        </p>
      </div>
    </div>
  )
}
