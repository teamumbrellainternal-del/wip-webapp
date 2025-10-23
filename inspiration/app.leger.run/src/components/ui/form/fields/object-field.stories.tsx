import type { StoryDefault } from '@ladle/react'
import { useState } from 'react'
import { ObjectField } from './object-field'

export default {
  title: 'Form Fields / Object Field',
} satisfies StoryDefault

export const Basic = () => {
  const [value, setValue] = useState<Record<string, any>>({
    name: 'John Doe',
    age: 30,
    isActive: true,
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="User Configuration"
        description="Configure user properties with dynamic types"
        value={value}
        onChange={setValue}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const Empty = () => {
  const [value, setValue] = useState<Record<string, any>>({})

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Empty Object"
        description="Start by adding properties to build your object"
        value={value}
        onChange={setValue}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const NestedObjects = () => {
  const [value, setValue] = useState<Record<string, any>>({
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    settings: {
      theme: 'dark',
      notifications: {
        email: true,
        push: false,
      },
    },
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Nested Configuration"
        description="Objects can contain other objects up to 3 levels deep"
        value={value}
        onChange={setValue}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const AllPropertyTypes = () => {
  const [value, setValue] = useState<Record<string, any>>({
    stringProp: 'Hello World',
    numberProp: 42,
    booleanProp: true,
    nestedObject: {
      nested: 'value',
    },
    arrayProp: ['item1', 'item2', 'item3'],
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="All Property Types"
        description="Demonstrates all supported property types: string, number, boolean, object, and array"
        value={value}
        onChange={setValue}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const MaxDepthReached = () => {
  const [value, setValue] = useState<Record<string, any>>({
    level1: {
      level2: {
        level3: {
          level4: 'This will show max depth message',
        },
      },
    },
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Max Depth Example"
        description="Maximum nesting depth is 3 levels. Deeper objects show a warning."
        value={value}
        onChange={setValue}
        maxDepth={3}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const CustomDepthLimit = () => {
  const [value, setValue] = useState<Record<string, any>>({
    level1: {
      data: 'shallow nesting only',
    },
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Shallow Nesting"
        description="Custom maxDepth of 1 - only allows one level of nesting"
        value={value}
        onChange={setValue}
        maxDepth={1}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const RestrictedTypes = () => {
  const [value, setValue] = useState<Record<string, any>>({
    name: 'Test',
    enabled: true,
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Restricted Types"
        description="Only string and boolean types are allowed in this example"
        value={value}
        onChange={setValue}
        allowedTypes={['string', 'boolean']}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const DisabledState = () => {
  const [value] = useState<Record<string, any>>({
    name: 'Read Only',
    value: 42,
    nested: {
      data: 'Cannot edit',
    },
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Disabled Configuration"
        description="This object field is read-only"
        value={value}
        disabled={true}
      />
    </div>
  )
}

export const WithError = () => {
  const [value, setValue] = useState<Record<string, any>>({
    invalid: 'config',
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Invalid Configuration"
        description="This field has validation errors"
        value={value}
        onChange={setValue}
        error="Configuration must contain at least 3 properties"
      />
    </div>
  )
}

export const RealWorldDatabaseConfig = () => {
  const [value, setValue] = useState<Record<string, any>>({
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    username: 'admin',
    password: 'secret123',
    ssl: true,
    pooling: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
    },
    options: {
      connectionTimeoutMillis: 2000,
      statement_timeout: 5000,
    },
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Database Configuration"
        description="Real-world example: PostgreSQL connection configuration"
        value={value}
        onChange={setValue}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Generated Config:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const RealWorldAPIConfig = () => {
  const [value, setValue] = useState<Record<string, any>>({
    baseURL: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    auth: {
      type: 'bearer',
      enabled: true,
    },
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="API Client Configuration"
        description="Real-world example: HTTP client configuration"
        value={value}
        onChange={setValue}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Generated Config:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const ArrayHandling = () => {
  const [value, setValue] = useState<Record<string, any>>({
    simpleArray: ['one', 'two', 'three'],
    numericArray: [1, 2, 3],
    mixedArray: ['string', 42, true],
  })

  return (
    <div className="max-w-2xl p-8">
      <ObjectField
        label="Array Properties"
        description="Arrays are edited as JSON strings - demonstrates array handling"
        value={value}
        onChange={setValue}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Current Value:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  )
}
