/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import type { NextPage } from 'next';
import Head from 'next/head';

/**
 * Root
 */
const Root = styled.div``;

/**
 * Layout Component
 */
const Layout: NextPage<{
  children: React.ReactElement,
  title?: string,
  description?: string,
}> = ({
  title,
  description,
  children,
  ...props
}) => {
  return (
    <Root {...props}>
      <Head>
        <title>
          {
            title ? (
              `${title} | Forekaster`
            ) : 'Forekaster | A neat way to learn about the current weather and forecast'
          }
        </title>
        <meta name="description" content={description ?? 'A neat way to learn about the current weather and forecast'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {children}
    </Root>
  );
};

export default Layout;
